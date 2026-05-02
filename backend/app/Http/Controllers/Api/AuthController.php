<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'referral_code' => ['nullable', 'string', 'max:64'],
            'ref' => ['nullable', 'string', 'max:64'],
        ]);

        $referrerCode = $validated['referral_code']
            ?? $validated['ref']
            ?? $request->cookie('affiliate_ref');

        $referrerCode = $referrerCode !== null ? strtoupper(trim($referrerCode)) : null;

        $referrerAffiliate = null;
        if ($referrerCode !== null && $referrerCode !== '') {
            $referrerAffiliate = Affiliate::where('referral_code', $referrerCode)->first();
        }

        $user = DB::transaction(function () use ($validated, $referrerAffiliate): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $affiliate = Affiliate::ensureForUser($user);

            if (
                $referrerAffiliate !== null
                && $referrerAffiliate->user_id !== $user->id
                && $referrerAffiliate->id !== $affiliate->id
            ) {
                Referral::firstOrCreate(
                    ['referred_user_id' => $user->id],
                    [
                        'affiliate_id' => $referrerAffiliate->id,
                        'commission_amount' => 0,
                        'status' => 'pending',
                    ]
                );
            }

            return $user;
        });

        $token = Auth::guard('api')->login($user);

        return tap($this->respondWithToken($token), function ($response): void {
            $response->headers->setCookie(cookie()->forget('affiliate_ref'));
        });
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials.'], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::guard('api')->user();
        Affiliate::ensureForUser($user);

        return $this->respondWithToken($token);
    }

    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Successfully logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        Affiliate::ensureForUser($user);
        $user->load('affiliate');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'affiliate' => $user->affiliate ? [
                'referral_code' => $user->affiliate->referral_code,
                'balance' => (string) $user->affiliate->balance,
            ] : null,
        ]);
    }

    protected function respondWithToken(string $token): JsonResponse
    {
        $ttl = (int) Auth::guard('api')->factory()->getTTL();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $ttl * 60,
        ]);
    }

}
