<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliateDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $affiliate = Affiliate::ensureForUser($user);

        $totalClicks = $affiliate->clicks()->count();

        $earnedCommissions = (string) $affiliate->referrals()
            ->where('status', 'paid')
            ->sum('commission_amount');

        $successfulRegistrations = $affiliate->referrals()->count();

        $recentReferrals = $affiliate->referrals()
            ->with(['referredUser:id,name,email'])
            ->latest()
            ->take(10)
            ->get()
            ->map(static function ($referral): array {
                return [
                    'id' => $referral->id,
                    'referred_user' => $referral->referredUser ? [
                        'name' => $referral->referredUser->name,
                        'email' => $referral->referredUser->email,
                    ] : null,
                    'commission_amount' => (string) $referral->commission_amount,
                    'status' => $referral->status,
                    'created_at' => $referral->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'referral_code' => $affiliate->referral_code,
            'balance' => (string) $affiliate->balance,
            'total_clicks' => $totalClicks,
            'earned_commissions' => $earnedCommissions,
            'successful_registrations' => $successfulRegistrations,
            'recent_referrals' => $recentReferrals,
        ]);
    }
}
