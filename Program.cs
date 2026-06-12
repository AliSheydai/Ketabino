using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ketabino.Database;
using Ketabino.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure CORS for Next.js frontend connection
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", "https://localhost:3000",
                "http://localhost:3001", "https://localhost:3001"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});


// 2. Add controllers and OpenAPI support
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "Ketabino API";
    options.AddSecurity("Bearer", System.Linq.Enumerable.Empty<string>(), new NSwag.OpenApiSecurityScheme
    {
        Type = NSwag.OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter the JWT token (without the 'Bearer ' prefix)."
    });
    options.OperationProcessors.Add(new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("Bearer"));
});

// 3. Register database services and helpers
builder.Services.AddSingleton<DatabaseConnectionProvider>();
builder.Services.AddTransient<SqliteDbHelper>();
builder.Services.AddTransient<SchemaInitializer>();

// 4. Register JWT Service
builder.Services.AddSingleton<JwtService>();

// 5. Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var secret = builder.Configuration["Jwt:SecretKey"] ?? "KetabinoSuperSecretKey1234567890!@#$";
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "KetabinoApi",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "KetabinoClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});

var app = builder.Build();

// 6. Run Database Schema Initialization on startup
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<SchemaInitializer>();
    await initializer.InitializeAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseCors("AllowNextJs");

app.UseHttpsRedirection();

app.UseAuthentication(); // MUST be placed before UseAuthorization()
app.UseAuthorization();

app.MapControllers();

app.Run();

