<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateClick;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackClickController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => ['required', 'string', 'max:64'],
        ]);

        $code = strtoupper(trim($validated['ref']));
        $affiliate = Affiliate::where('referral_code', $code)->first();

        if ($affiliate === null) {
            return response()->json(['message' => 'Unknown referral code.'], Response::HTTP_NOT_FOUND);
        }

        AffiliateClick::create([
            'affiliate_id' => $affiliate->id,
            'metadata' => [
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ],
        ]);

        $minutes = 60 * 24 * 30;

        return response()->json(['tracked' => true])->cookie(
            'affiliate_ref',
            $affiliate->referral_code,
            $minutes,
            '/',
            null,
            $request->secure(),
            true,
            false,
            'lax'
        );
    }
}
