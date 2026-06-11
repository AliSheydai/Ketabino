using System;
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
    public class ReportController : ControllerBase
    {
        private readonly SqliteDbHelper _db;

        public ReportController(SqliteDbHelper db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitReport([FromBody] ReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TargetType) || request.TargetId <= 0 || string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest(new { Message = "مشخصات هدف گزارش و علت الزامی است." });
            }

            if (request.TargetType != "Book" && request.TargetType != "Chapter" && request.TargetType != "Comment")
            {
                return BadRequest(new { Message = "نوع هدف گزارش نامعتبر است." });
            }

            long userId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sql = @"
                INSERT INTO REPORTS (USER_ID, TARGET_TYPE, TARGET_ID, REASON, DESCRIPTION, STATUS) 
                VALUES (:userId, :targetType, :targetId, :reason, :desc, 'Pending')";

            var parameters = new[]
            {
                new SqliteParameter("userId", userId),
                new SqliteParameter("targetType", request.TargetType),
                new SqliteParameter("targetId", request.TargetId),
                new SqliteParameter("reason", request.Reason),
                new SqliteParameter("desc", SqliteDbHelper.ToDbValue(request.Description))
            };

            await _db.ExecuteNonQueryAsync(sql, parameters);
            return Ok(new { Message = "گزارش شما با موفقیت ثبت شد و توسط مدیریت بررسی خواهد شد." });
        }
    }
}
