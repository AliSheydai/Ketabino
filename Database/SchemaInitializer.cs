using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Data.Sqlite;

namespace Ketabino.Database
{
    public class SchemaInitializer
    {
        private readonly DatabaseConnectionProvider _connectionProvider;
        private readonly ILogger<SchemaInitializer> _logger;

        public SchemaInitializer(DatabaseConnectionProvider connectionProvider, ILogger<SchemaInitializer> logger)
        {
            _connectionProvider = connectionProvider;
            _logger = logger;
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Checking database initialization...");
                using var connection = await _connectionProvider.CreateConnectionAsync();

                // Check if the USERS table exists
                var checkTableSql = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='USERS'";
                using var checkCmd = new SqliteCommand(checkTableSql, connection);
                var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

                if (count == 0)
                {
                    _logger.LogInformation("Database tables do not exist. Starting schema execution...");
                    await ExecuteSchemaScriptAsync(connection);
                    await SeedDataAsync(connection);
                    _logger.LogInformation("Database initialized and seeded successfully.");
                }
                else
                {
                    _logger.LogInformation("Database tables already exist. Checking for missing tables...");
                    await CreateNewTablesIfMissingAsync(connection);
                }
            }
            catch (SqliteException ex)
            {
                _logger.LogWarning(ex, "SQLite database connection error.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while initializing the database schema.");
            }
        }

        private async Task ExecuteSchemaScriptAsync(SqliteConnection connection)
        {
            var schemaPath = Path.Combine(AppContext.BaseDirectory, "schema.sql");
            if (!File.Exists(schemaPath))
            {
                // Fallback to project root directory in development
                schemaPath = Path.Combine(Directory.GetCurrentDirectory(), "schema.sql");
            }

            if (!File.Exists(schemaPath))
            {
                _logger.LogError("schema.sql file not found at path: {Path}", schemaPath);
                return;
            }

            var script = await File.ReadAllTextAsync(schemaPath);
            try
            {
                using var command = new SqliteCommand(script, connection);
                await command.ExecuteNonQueryAsync();
            }
            catch (SqliteException ex)
            {
                _logger.LogError(ex, "Schema execution failed.");
            }
        }

        private async Task SeedDataAsync(SqliteConnection connection)
        {
            _logger.LogInformation("Seeding initial data...");

            // 1. Seed Genres
            string[] genres = { "داستانی", "رمان", "تاریخی", "علمی تخیلی", "زندگینامه", "شعر", "کودک و نوجوان", "روانشناسی" };
            foreach (var genre in genres)
            {
                try
                {
                    var sql = "INSERT INTO GENRES (NAME) VALUES (:name)";
                    using var cmd = new SqliteCommand(sql, connection);
                    cmd.Parameters.Add(new SqliteParameter("name", genre));
                    await cmd.ExecuteNonQueryAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to seed genre: {Genre}", genre);
                }
            }

            // 2. Seed Coin Packages
            var packages = new[]
            {
                new { Name = "بسته ۵۰ سکه", Coins = 50, Price = 10000m },
                new { Name = "بسته ۱۰۰ سکه + ۱۰ سکه هدیه", Coins = 110, Price = 20000m },
                new { Name = "بسته ۵۰۰ سکه + ۷۰ سکه هدیه", Coins = 570, Price = 90000m },
                new { Name = "بسته ۱۰۰۰ سکه + ۲۰۰ سکه هدیه", Coins = 1200, Price = 170000m }
            };

            foreach (var p in packages)
            {
                try
                {
                    var sql = "INSERT INTO COIN_PACKAGES (NAME, COINS, PRICE, IS_ACTIVE) VALUES (:name, :coins, :price, 1)";
                    using var cmd = new SqliteCommand(sql, connection);
                    cmd.Parameters.Add(new SqliteParameter("name", p.Name));
                    cmd.Parameters.Add(new SqliteParameter("coins", p.Coins));
                    cmd.Parameters.Add(new SqliteParameter("price", p.Price));
                    await cmd.ExecuteNonQueryAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to seed coin package: {Package}", p.Name);
                }
            }

            // 3. Seed Subscription Plans
            var plans = new[]
            {
                new { Name = "اشتراک طلایی یک ماهه", Price = 49000m, Duration = 30, Desc = "دسترسی به تمام کتابهای رایگان و ۲۰ درصد تخفیف خرید فصول غیر رایگان" },
                new { Name = "اشتراک ویژه سه ماهه", Price = 129000m, Duration = 90, Desc = "دسترسی به تمام کتابهای رایگان و ۳۰ درصد تخفیف خرید فصول غیر رایگان به همراه پشتیبانی ویژه" },
                new { Name = "اشتراک بی نهایت شش ماهه", Price = 219000m, Duration = 180, Desc = "دسترسی بی نهایت و کامل به تمامی فصول در طول دوره بدون نیاز به خرید جداگانه" }
            };

            foreach (var plan in plans)
            {
                try
                {
                    var sql = "INSERT INTO SUBSCRIPTION_PLANS (NAME, PRICE, DURATION_DAYS, DESCRIPTION, IS_ACTIVE) VALUES (:name, :price, :duration, :desc, 1)";
                    using var cmd = new SqliteCommand(sql, connection);
                    cmd.Parameters.Add(new SqliteParameter("name", plan.Name));
                    cmd.Parameters.Add(new SqliteParameter("price", plan.Price));
                    cmd.Parameters.Add(new SqliteParameter("duration", plan.Duration));
                    cmd.Parameters.Add(new SqliteParameter("desc", plan.Desc));
                    await cmd.ExecuteNonQueryAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to seed subscription plan: {Plan}", plan.Name);
                }
            }

            // 4. Seed Mock Users
            _logger.LogInformation("Seeding mock users, books, and interactions...");
            try
            {
                var users = new[]
                {
                    new { Phone = "09120000001", Name = "ادمین سیستم", Role = "Admin" },
                    new { Phone = "09120000002", Name = "صادق هدایت", Role = "Author" },
                    new { Phone = "09120000003", Name = "امین (خواننده)", Role = "Reader" }
                };

                foreach (var u in users)
                {
                    var sql = "INSERT INTO USERS (PHONE_NUMBER, NAME, ROLE) VALUES (:phone, :name, :role)";
                    using var cmd = new SqliteCommand(sql, connection);
                    cmd.Parameters.Add(new SqliteParameter("phone", u.Phone));
                    cmd.Parameters.Add(new SqliteParameter("name", u.Name));
                    cmd.Parameters.Add(new SqliteParameter("role", u.Role));
                    await cmd.ExecuteNonQueryAsync();
                }

                // Create Wallets for users (IDs will be 1, 2, 3)
                for (int i = 1; i <= 3; i++)
                {
                    var wSql = "INSERT INTO WALLETS (USER_ID, BALANCE) VALUES (:uid, :bal)";
                    using var wCmd = new SqliteCommand(wSql, connection);
                    wCmd.Parameters.Add(new SqliteParameter("uid", i));
                    wCmd.Parameters.Add(new SqliteParameter("bal", i == 3 ? 500 : 0)); // Reader has 500 coins
                    await wCmd.ExecuteNonQueryAsync();
                }

                // 5. Seed Author Profile (User ID = 2)
                var apSql = "INSERT INTO AUTHOR_PROFILES (USER_ID, BIO, PROFILE_IMAGE) VALUES (2, 'نویسنده نامدار ایرانی، خالق بوف کور.', 'https://picsum.photos/200')";
                using var apCmd = new SqliteCommand(apSql, connection);
                await apCmd.ExecuteNonQueryAsync();

                // 6. Seed Books
                var bSql = @"INSERT INTO BOOKS (AUTHOR_ID, TITLE, DESCRIPTION, COVER_IMAGE, STATUS) 
                             VALUES (2, 'بوف کور', 'بوف کور شناخته‌شده‌ترین اثر صادق هدایت است.', 'https://picsum.photos/400/600?random=1', 'Published')";
                using var bCmd = new SqliteCommand(bSql, connection);
                await bCmd.ExecuteNonQueryAsync();

                var bSql2 = @"INSERT INTO BOOKS (AUTHOR_ID, TITLE, DESCRIPTION, COVER_IMAGE, STATUS) 
                             VALUES (2, 'سگ ولگرد', 'مجموعه داستان کوتاه از صادق هدایت.', 'https://picsum.photos/400/600?random=2', 'Published')";
                using var bCmd2 = new SqliteCommand(bSql2, connection);
                await bCmd2.ExecuteNonQueryAsync();

                var bSql3 = @"INSERT INTO BOOKS (AUTHOR_ID, TITLE, DESCRIPTION, COVER_IMAGE, STATUS) 
                             VALUES (2, 'سه قطره خون', 'مجموعه‌ای از داستان‌های کوتاه سورئال.', 'https://picsum.photos/400/600?random=3', 'Published')";
                using var bCmd3 = new SqliteCommand(bSql3, connection);
                await bCmd3.ExecuteNonQueryAsync();

                var bSql4 = @"INSERT INTO BOOKS (AUTHOR_ID, TITLE, DESCRIPTION, COVER_IMAGE, STATUS) 
                             VALUES (2, 'زنده به گور', 'داستانی کوتاه و عمیق درباره مرگ.', 'https://picsum.photos/400/600?random=4', 'Published')";
                using var bCmd4 = new SqliteCommand(bSql4, connection);
                await bCmd4.ExecuteNonQueryAsync();

                // 7. Seed Book Genres (Assuming Genres 1=داستانی, 2=رمان)
                // Book 1 -> Genre 2 (رمان)
                var bgSql = "INSERT INTO BOOK_GENRES (BOOK_ID, GENRE_ID) VALUES (1, 2); INSERT INTO BOOK_GENRES (BOOK_ID, GENRE_ID) VALUES (2, 1); INSERT INTO BOOK_GENRES (BOOK_ID, GENRE_ID) VALUES (3, 1); INSERT INTO BOOK_GENRES (BOOK_ID, GENRE_ID) VALUES (4, 1);";
                using var bgCmd = new SqliteCommand(bgSql, connection);
                await bgCmd.ExecuteNonQueryAsync();

                // 8. Seed Chapters
                var chs = new[]
                {
                    new { BId = 1, Title = "فصل اول", Seq = 1, Price = 0, IsFree = 1, Content = "در زندگی دردهایی هست که روح را منزوی و در تنهایی می‌خورد و می‌تراشد..." },
                    new { BId = 1, Title = "فصل دوم", Seq = 2, Price = 50, IsFree = 0, Content = "این فصل غیر رایگان است. کاربر برای خواندن آن باید سکه پرداخت کند..." },
                    new { BId = 1, Title = "فصل سوم", Seq = 3, Price = 60, IsFree = 0, Content = "ادامه داستان شگفت انگیز بوف کور..." },
                    new { BId = 2, Title = "داستان اول", Seq = 1, Price = 0, IsFree = 1, Content = "سگ ولگرد یکی از داستان‌های این مجموعه است..." }
                };

                foreach (var c in chs)
                {
                    var cSql = "INSERT INTO CHAPTERS (BOOK_ID, TITLE, SEQUENCE_NUMBER, PRICE, IS_FREE, CONTENT, STATUS) VALUES (:bid, :title, :seq, :price, :free, :content, 'Published')";
                    using var cCmd = new SqliteCommand(cSql, connection);
                    cCmd.Parameters.Add(new SqliteParameter("bid", c.BId));
                    cCmd.Parameters.Add(new SqliteParameter("title", c.Title));
                    cCmd.Parameters.Add(new SqliteParameter("seq", c.Seq));
                    cCmd.Parameters.Add(new SqliteParameter("price", c.Price));
                    cCmd.Parameters.Add(new SqliteParameter("free", c.IsFree));
                    cCmd.Parameters.Add(new SqliteParameter("content", c.Content));
                    await cCmd.ExecuteNonQueryAsync();
                }

                // 9. Seed Purchases
                var pSql = "INSERT INTO PURCHASES (USER_ID, CHAPTER_ID, PRICE_PAID) VALUES (3, 2, 50)"; // Reader bought chapter 2
                using var pCmd = new SqliteCommand(pSql, connection);
                await pCmd.ExecuteNonQueryAsync();

                // 10. Seed Reviews
                var rSql = "INSERT INTO REVIEWS (USER_ID, BOOK_ID, RATING, TITLE, CONTENT) VALUES (3, 1, 5, 'عالی', 'شاهکار - یکی از بهترین کتاب‌هایی که خواندم.')";
                using var rCmd = new SqliteCommand(rSql, connection);
                await rCmd.ExecuteNonQueryAsync();

                // 11. Seed Comments
                var cmSql = "INSERT INTO COMMENTS (USER_ID, BOOK_ID, CHAPTER_ID, CONTENT) VALUES (3, 1, 1, 'پاراگراف اول خیلی تکان‌دهنده بود.')";
                using var cmCmd = new SqliteCommand(cmSql, connection);
                await cmCmd.ExecuteNonQueryAsync();

            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to seed mock entities.");
            }
        }

        private async Task CreateNewTablesIfMissingAsync(SqliteConnection connection)
        {
            string[] tables = { "BOOK_CLUBS", "BOOK_CLUB_MEMBERS", "BOOK_CLUB_MESSAGES", "CHALLENGES", "USER_CHALLENGES" };
            foreach (var table in tables)
            {
                var checkSql = $"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='{table}'";
                using var cmd = new SqliteCommand(checkSql, connection);
                var count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                if (count == 0)
                {
                    _logger.LogInformation("Creating missing table: {Table}", table);
                    string createSql = "";
                    if (table == "BOOK_CLUBS")
                    {
                        createSql = @"CREATE TABLE BOOK_CLUBS (
                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
                            CREATOR_ID INTEGER NOT NULL,
                            BOOK_ID INTEGER NOT NULL,
                            NAME TEXT NOT NULL,
                            DESCRIPTION TEXT,
                            CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            FOREIGN KEY (CREATOR_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
                            FOREIGN KEY (BOOK_ID) REFERENCES BOOKS(ID) ON DELETE CASCADE
                        );";
                    }
                    else if (table == "BOOK_CLUB_MEMBERS")
                    {
                        createSql = @"CREATE TABLE BOOK_CLUB_MEMBERS (
                            BOOK_CLUB_ID INTEGER NOT NULL,
                            USER_ID INTEGER NOT NULL,
                            JOINED_AT DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            PRIMARY KEY (BOOK_CLUB_ID, USER_ID),
                            FOREIGN KEY (BOOK_CLUB_ID) REFERENCES BOOK_CLUBS(ID) ON DELETE CASCADE,
                            FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
                        );";
                    }
                    else if (table == "BOOK_CLUB_MESSAGES")
                    {
                        createSql = @"CREATE TABLE BOOK_CLUB_MESSAGES (
                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
                            BOOK_CLUB_ID INTEGER NOT NULL,
                            USER_ID INTEGER NOT NULL,
                            CONTENT TEXT NOT NULL,
                            CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            FOREIGN KEY (BOOK_CLUB_ID) REFERENCES BOOK_CLUBS(ID) ON DELETE CASCADE,
                            FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
                        );";
                    }
                    else if (table == "CHALLENGES")
                    {
                        createSql = @"CREATE TABLE CHALLENGES (
                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
                            TITLE TEXT NOT NULL,
                            DESCRIPTION TEXT NOT NULL,
                            TARGET_TYPE TEXT NOT NULL,
                            TARGET_COUNT INTEGER NOT NULL,
                            COIN_REWARD INTEGER NOT NULL,
                            END_DATE DATETIME NOT NULL,
                            IS_ACTIVE INTEGER DEFAULT 1 NOT NULL
                        );";
                    }
                    else if (table == "USER_CHALLENGES")
                    {
                        createSql = @"CREATE TABLE USER_CHALLENGES (
                            USER_ID INTEGER NOT NULL,
                            CHALLENGE_ID INTEGER NOT NULL,
                            CURRENT_PROGRESS INTEGER DEFAULT 0 NOT NULL,
                            IS_COMPLETED INTEGER DEFAULT 0 NOT NULL,
                            CLAIMED_AT DATETIME,
                            PRIMARY KEY (USER_ID, CHALLENGE_ID),
                            FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
                            FOREIGN KEY (CHALLENGE_ID) REFERENCES CHALLENGES(ID) ON DELETE CASCADE
                        );";
                    }

                    using var createCmd = new SqliteCommand(createSql, connection);
                    await createCmd.ExecuteNonQueryAsync();

                    if (table == "CHALLENGES")
                    {
                        await SeedNewChallengesAsync(connection);
                    }
                }
            }
        }

        private async Task SeedNewChallengesAsync(SqliteConnection connection)
        {
            var challenges = new[]
            {
                new { Title = "کتاب‌خوان حرفه‌ای", Desc = "۳ کتاب مختلف را شروع کرده و پیشرفت مطالعه ثبت کنید.", TargetType = "Books", TargetCount = 3, Reward = 100, Days = 30 },
                new { Title = "مداومت در خواندن", Desc = "۱۰ فصل مختلف از کتاب‌ها را خریداری یا مطالعه کنید.", TargetType = "Chapters", TargetCount = 10, Reward = 250, Days = 14 },
                new { Title = "سرمایه‌گذاری روی یادگیری", Desc = "۵۰۰ سکه به کیف پول خود اضافه کنید.", TargetType = "Coins", TargetCount = 500, Reward = 50, Days = 7 }
            };

            foreach (var c in challenges)
            {
                var sql = @"INSERT INTO CHALLENGES (TITLE, DESCRIPTION, TARGET_TYPE, TARGET_COUNT, COIN_REWARD, END_DATE, IS_ACTIVE) 
                            VALUES (:title, :desc, :type, :count, :reward, :endDate, 1)";
                using var cmd = new SqliteCommand(sql, connection);
                cmd.Parameters.Add(new SqliteParameter("title", c.Title));
                cmd.Parameters.Add(new SqliteParameter("desc", c.Desc));
                cmd.Parameters.Add(new SqliteParameter("type", c.TargetType));
                cmd.Parameters.Add(new SqliteParameter("count", c.TargetCount));
                cmd.Parameters.Add(new SqliteParameter("reward", c.Reward));
                cmd.Parameters.Add(new SqliteParameter("endDate", DateTime.UtcNow.AddDays(c.Days)));
                await cmd.ExecuteNonQueryAsync();
            }
        }
    }
}

