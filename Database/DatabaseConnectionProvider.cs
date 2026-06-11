using System.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.Sqlite;

namespace Ketabino.Database
{
    public class DatabaseConnectionProvider
    {
        private readonly string _connectionString;

        public DatabaseConnectionProvider(IConfiguration configuration)
        {
            // Fallback connection string for local development if not configured
            _connectionString = configuration.GetConnectionString("OracleDb") 
                                ?? "Data Source=ketabino.db";
        }

        public SqliteConnection CreateConnection()
        {
            return new SqliteConnection(_connectionString);
        }

        public async Task<SqliteConnection> CreateConnectionAsync()
        {
            var connection = new SqliteConnection(_connectionString);
            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync();
            }
            return connection;
        }
    }
}
