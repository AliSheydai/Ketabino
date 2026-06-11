using System;

namespace Ketabino.Models
{
    public class WalletResponse
    {
        public long UserId { get; set; }
        public decimal Balance { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class TransactionResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // "Deposit", "Withdrawal", "Purchase", "Refund"
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BuyCoinsRequest
    {
        public int CoinPackageId { get; set; }
    }

    public class CoinPackageResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Coins { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
    }
}
