using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Ketabino.Database;

namespace Ketabino.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly SqliteDbHelper _db;

        public NotificationController(SqliteDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            long userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sql = "SELECT ID, USER_ID, TITLE, MESSAGE, IS_READ, CREATED_AT FROM NOTIFICATIONS WHERE USER_ID = :userId ORDER BY CREATED_AT DESC";
            var notifications = await _db.QueryAsync(sql, new[] { new SqliteParameter("userId", userId) }, reader => new
            {
                Id = Convert.ToInt64(reader["ID"]),
                UserId = Convert.ToInt64(reader["USER_ID"]),
                Title = reader["TITLE"].ToString()!,
                Message = reader["MESSAGE"].ToString()!,
                IsRead = Convert.ToInt32(reader["IS_READ"]) == 1,
                CreatedAt = SqliteDbHelper.GetUtcDateTime(reader["CREATED_AT"])
            });

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            long userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sql = "UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE ID = :id AND USER_ID = :userId";
            var updatedRows = await _db.ExecuteNonQueryAsync(sql, new[]
            {
                new SqliteParameter("id", id),
                new SqliteParameter("userId", userId)
            });

            if (updatedRows == 0) return NotFound(new { Message = "اعلان یافت نشد." });

            return Ok(new { Message = "اعلان به عنوان خوانده شده علامت‌گذاری شد." });
        }
    }
}
