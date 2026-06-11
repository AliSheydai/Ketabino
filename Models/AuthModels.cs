using System;

namespace Ketabino.Models
{
    public class RegisterRequest
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Reader"; // "Reader" or "Author"
    }

    public class LoginRequest
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = "12345"; // Mock code
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserResponse User { get; set; } = new();
    }

    public class UserResponse
    {
        public long Id { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AuthorProfileRequest
    {
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
        public string? SocialLinks { get; set; }
    }

    public class AuthorProfileResponse
    {
        public long UserId { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
        public string? SocialLinks { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
