using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Ketabino.Database;
using Ketabino.Models;

namespace Ketabino.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenreController : ControllerBase
    {
        private readonly SqliteDbHelper _db;

        public GenreController(SqliteDbHelper db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetGenres()
        {
            var sql = "SELECT ID, NAME FROM GENRES ORDER BY NAME ASC";
            var genres = await _db.QueryAsync(sql, null, reader => new GenreResponse
            {
                Id = Convert.ToInt32(reader["ID"]),
                Name = reader["NAME"].ToString()!
            });

            return Ok(genres);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateGenre([FromBody] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { Message = "نام ژانر الزامی است." });
            }

            var checkSql = "SELECT COUNT(*) FROM GENRES WHERE NAME = :name";
            var exists = Convert.ToInt32(await _db.ExecuteScalarAsync(checkSql, new[] { new SqliteParameter("name", name) }));

            if (exists > 0)
            {
                return Conflict(new { Message = "این ژانر قبلاً ایجاد شده است." });
            }

            var sql = "INSERT INTO GENRES (NAME) VALUES (:name)";
            await _db.ExecuteNonQueryAsync(sql, new[] { new SqliteParameter("name", name) });

            return Ok(new { Message = "ژانر با موفقیت ایجاد شد." });
        }
    }
}
