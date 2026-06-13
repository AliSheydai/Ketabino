using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Ketabino.Database;
using Ketabino.Models;

namespace Ketabino.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly SqliteDbHelper _db;
        private readonly DatabaseConnectionProvider _connectionProvider;

        public AdminController(SqliteDbHelper db, DatabaseConnectionProvider connectionProvider)
        {
            _db = db;
            _connectionProvider = connectionProvider;
        }

        private string CurrentUserRole => User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty;

        private IActionResult CheckAdminRole()
        {
            if (CurrentUserRole != "Admin")
            {
                return StatusCode(403, new { Message = "دسترسی فقط برای مدیران سیستم مجاز است." });
            }
            return null!;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            using var connection = await _connectionProvider.CreateConnectionAsync();

            var stats = new AdminStatsResponse();

            // 1. Total Users
            using (var cmd = new SqliteCommand("SELECT COUNT(*) FROM USERS", connection))
            {
                stats.TotalUsers = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            }

            // 2. Total Authors
            using (var cmd = new SqliteCommand("SELECT COUNT(*) FROM USERS WHERE ROLE = 'Author'", connection))
            {
                stats.TotalAuthors = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            }

            // 3. Total Books
            using (var cmd = new SqliteCommand("SELECT COUNT(*) FROM BOOKS", connection))
            {
                stats.TotalBooks = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            }

            // 4. Total Reports
            using (var cmd = new SqliteCommand("SELECT COUNT(*) FROM REPORTS", connection))
            {
                stats.TotalReports = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            }

            // 5. Total Coins Deposited
            using (var cmd = new SqliteCommand("SELECT COALESCE(SUM(AMOUNT), 0) FROM TRANSACTIONS WHERE AMOUNT > 0", connection))
            {
                stats.TotalCoinsDeposited = Convert.ToDecimal(await cmd.ExecuteScalarAsync());
            }

            return Ok(stats);
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            var sql = @"
                SELECT r.ID, r.USER_ID, u.NAME AS USER_NAME, r.TARGET_TYPE, r.TARGET_ID, r.REASON, r.DESCRIPTION, r.STATUS, r.CREATED_AT
                FROM REPORTS r
                JOIN USERS u ON r.USER_ID = u.ID
                ORDER BY r.CREATED_AT DESC";

            var reports = await _db.QueryAsync(sql, Array.Empty<SqliteParameter>(), reader => new AdminReportResponse
            {
                Id = Convert.ToInt64(reader["ID"]),
                UserId = Convert.ToInt64(reader["USER_ID"]),
                UserName = reader["USER_NAME"].ToString()!,
                TargetType = reader["TARGET_TYPE"].ToString()!,
                TargetId = Convert.ToInt64(reader["TARGET_ID"]),
                Reason = reader["REASON"].ToString()!,
                Description = reader["DESCRIPTION"] == DBNull.Value ? null : reader["DESCRIPTION"].ToString(),
                Status = reader["STATUS"].ToString()!,
                CreatedAt = SqliteDbHelper.GetUtcDateTime(reader["CREATED_AT"])
            });

            return Ok(reports);
        }

        [HttpPost("reports/{id}/resolve")]
        public async Task<IActionResult> ResolveReport(long id, [FromBody] ResolveReportRequest request)
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            var sql = "UPDATE REPORTS SET STATUS = :status WHERE ID = :id";
            var parameters = new[]
            {
                new SqliteParameter("status", request.Status), // 'Resolved' or 'Dismissed'
                new SqliteParameter("id", id)
            };

            var rows = await _db.ExecuteNonQueryAsync(sql, parameters);
            if (rows == 0) return NotFound(new { Message = "گزارش مورد نظر یافت نشد." });

            return Ok(new { Message = "وضعیت گزارش با موفقیت به‌روزرسانی شد." });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            var sql = @"
                SELECT u.ID, u.PHONE_NUMBER, u.NAME, u.ROLE, u.CREATED_AT, w.BALANCE
                FROM USERS u
                LEFT JOIN WALLETS w ON u.ID = w.USER_ID
                ORDER BY u.CREATED_AT DESC";

            var users = await _db.QueryAsync(sql, Array.Empty<SqliteParameter>(), reader => new AdminUserResponse
            {
                Id = Convert.ToInt64(reader["ID"]),
                PhoneNumber = reader["PHONE_NUMBER"].ToString()!,
                Name = reader["NAME"].ToString()!,
                Role = reader["ROLE"].ToString()!,
                CreatedAt = SqliteDbHelper.GetUtcDateTime(reader["CREATED_AT"]),
                Balance = reader["BALANCE"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["BALANCE"])
            });

            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(long id, [FromBody] UpdateRoleRequest request)
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            if (request.Role != "Reader" && request.Role != "Author" && request.Role != "Admin")
            {
                return BadRequest(new { Message = "نقش کاربری وارد شده نامعتبر است." });
            }

            using var connection = await _connectionProvider.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Update User Role
                var updateSql = "UPDATE USERS SET ROLE = :role WHERE ID = :id";
                using (var cmd = new SqliteCommand(updateSql, connection, transaction))
                {
                    cmd.Parameters.Add(new SqliteParameter("role", request.Role));
                    cmd.Parameters.Add(new SqliteParameter("id", id));
                    var rows = await cmd.ExecuteNonQueryAsync();
                    if (rows == 0)
                    {
                        transaction.Rollback();
                        return NotFound(new { Message = "کاربر مورد نظر یافت نشد." });
                    }
                }

                // If Role is updated to Author, check and insert Author Profile if not exists
                if (request.Role == "Author")
                {
                    var checkProfileSql = "SELECT COUNT(*) FROM AUTHOR_PROFILES WHERE USER_ID = :id";
                    int profileExists = 0;
                    using (var cmd = new SqliteCommand(checkProfileSql, connection, transaction))
                    {
                        cmd.Parameters.Add(new SqliteParameter("id", id));
                        profileExists = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                    }

                    if (profileExists == 0)
                    {
                        var insertProfileSql = "INSERT INTO AUTHOR_PROFILES (USER_ID, BIO, PROFILE_IMAGE) VALUES (:id, 'بیوگرافی پیش‌فرض نویسنده', 'https://picsum.photos/200')";
                        using (var cmd = new SqliteCommand(insertProfileSql, connection, transaction))
                        {
                            cmd.Parameters.Add(new SqliteParameter("id", id));
                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                }

                transaction.Commit();
                return Ok(new { Message = "نقش کاربر با موفقیت به‌روزرسانی شد." });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return StatusCode(500, new { Message = "خطایی رخ داد.", Error = ex.Message });
            }
        }

        [HttpDelete("books/{id}")]
        public async Task<IActionResult> DeleteBook(long id)
        {
            var forbidResult = CheckAdminRole();
            if (forbidResult != null) return forbidResult;

            var sql = "DELETE FROM BOOKS WHERE ID = :id";
            var parameters = new[] { new SqliteParameter("id", id) };

            var rows = await _db.ExecuteNonQueryAsync(sql, parameters);
            if (rows == 0) return NotFound(new { Message = "کتاب مورد نظر یافت نشد." });

            return Ok(new { Message = "کتاب با موفقیت از سیستم حذف شد." });
        }
    }

    public class AdminStatsResponse
    {
        public int TotalUsers { get; set; }
        public int TotalAuthors { get; set; }
        public int TotalBooks { get; set; }
        public int TotalReports { get; set; }
        public decimal TotalCoinsDeposited { get; set; }
    }

    public class AdminReportResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public long TargetId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ResolveReportRequest
    {
        public string Status { get; set; } = string.Empty; // 'Resolved' or 'Dismissed'
    }

    public class AdminUserResponse
    {
        public long Id { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public decimal Balance { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
