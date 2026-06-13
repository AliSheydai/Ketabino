using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace Ketabino.Database
{
    public class SqliteDbHelper
    {
        private readonly DatabaseConnectionProvider _connectionProvider;

        public SqliteDbHelper(DatabaseConnectionProvider connectionProvider)
        {
            _connectionProvider = connectionProvider;
        }

        public async Task<int> ExecuteNonQueryAsync(string sql, SqliteParameter[] parameters = null, SqliteTransaction transaction = null)
        {
            SqliteConnection connection = null;
            var shouldDisposeConnection = false;

            if (transaction != null)
            {
                connection = transaction.Connection;
            }
            else
            {
                connection = await _connectionProvider.CreateConnectionAsync();
                shouldDisposeConnection = true;
            }

            try
            {
                using var command = new SqliteCommand(sql, connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }

                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }

                return await command.ExecuteNonQueryAsync();
            }
            finally
            {
                if (shouldDisposeConnection && connection != null)
                {
                    await connection.CloseAsync();
                    await connection.DisposeAsync();
                }
            }
        }

        public async Task<object> ExecuteScalarAsync(string sql, SqliteParameter[] parameters = null, SqliteTransaction transaction = null)
        {
            SqliteConnection connection = null;
            var shouldDisposeConnection = false;

            if (transaction != null)
            {
                connection = transaction.Connection;
            }
            else
            {
                connection = await _connectionProvider.CreateConnectionAsync();
                shouldDisposeConnection = true;
            }

            try
            {
                using var command = new SqliteCommand(sql, connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }

                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }

                return await command.ExecuteScalarAsync();
            }
            finally
            {
                if (shouldDisposeConnection && connection != null)
                {
                    await connection.CloseAsync();
                    await connection.DisposeAsync();
                }
            }
        }

        public async Task<List<T>> QueryAsync<T>(string sql, SqliteParameter[] parameters = null, Func<SqliteDataReader, T> mapFunc = null, SqliteTransaction transaction = null)
        {
            var results = new List<T>();
            SqliteConnection connection = null;
            var shouldDisposeConnection = false;

            if (transaction != null)
            {
                connection = transaction.Connection;
            }
            else
            {
                connection = await _connectionProvider.CreateConnectionAsync();
                shouldDisposeConnection = true;
            }

            try
            {
                using var command = new SqliteCommand(sql, connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }

                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    if (mapFunc != null)
                    {
                        results.Add(mapFunc((SqliteDataReader)reader));
                    }
                }
            }
            finally
            {
                if (shouldDisposeConnection && connection != null)
                {
                    await connection.CloseAsync();
                    await connection.DisposeAsync();
                }
            }

            return results;
        }

        public async Task<T> QuerySingleOrDefaultAsync<T>(string sql, SqliteParameter[] parameters = null, Func<SqliteDataReader, T> mapFunc = null, SqliteTransaction transaction = null)
        {
            SqliteConnection connection = null;
            var shouldDisposeConnection = false;

            if (transaction != null)
            {
                connection = transaction.Connection;
            }
            else
            {
                connection = await _connectionProvider.CreateConnectionAsync();
                shouldDisposeConnection = true;
            }

            try
            {
                using var command = new SqliteCommand(sql, connection);
                if (transaction != null)
                {
                    command.Transaction = transaction;
                }

                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return mapFunc != null ? mapFunc((SqliteDataReader)reader) : default;
                }
                return default;
            }
            finally
            {
                if (shouldDisposeConnection && connection != null)
                {
                    await connection.CloseAsync();
                    await connection.DisposeAsync();
                }
            }
        }

        // Helper to convert C# values to DB values (handling null)
        public static object ToDbValue(object value)
        {
            return value ?? DBNull.Value;
        }

        // Helper to safely read from DB (handling DBNull)
        public static T FromDbValue<T>(object value)
        {
            if (value == null || value == DBNull.Value)
            {
                return default;
            }
            return (T)Convert.ChangeType(value, typeof(T));
        }

        // Helper to read DateTime as UTC
        public static DateTime GetUtcDateTime(object value)
        {
            if (value == null || value == DBNull.Value)
            {
                return DateTime.MinValue;
            }
            var dt = Convert.ToDateTime(value);
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }
    }
}
