<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Affiliate extends Model
{
    protected $fillable = [
        'user_id',
        'referral_code',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class);
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(bin2hex(random_bytes(4)));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    public static function ensureForUser(User $user): self
    {
        $existing = static::where('user_id', $user->id)->first();
        if ($existing !== null) {
            return $existing;
        }

        return static::create([
            'user_id' => $user->id,
            'referral_code' => static::generateUniqueCode(),
            'balance' => 0,
        ]);
    }
}
