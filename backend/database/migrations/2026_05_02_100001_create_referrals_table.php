<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('referred_user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('commission_amount', 15, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->unique('referred_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
