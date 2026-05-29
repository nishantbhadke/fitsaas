"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

function ProfileContent() {
  const { data: session, update: updateSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [gender, setGender] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [activityLevel, setActivityLevel] = useState("MODERATELY_ACTIVE");
  const [dailyWaterGoal, setDailyWaterGoal] = useState(2000);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);

  // Diet customizer state
  const [dietPlanEnabled, setDietPlanEnabled] = useState(false);
  const [dietType, setDietType] = useState("NON_VEGETARIAN");
  const [isLactoseIntolerant, setIsLactoseIntolerant] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchProfile = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setName(u.name || "");
        setImage(u.image || "");
        setGender(u.gender || "");
        setCycleLength(u.cycleLength || 28);
        
        if (u.lastPeriodStart) {
          const d = new Date(u.lastPeriodStart);
          if (!isNaN(d.getTime())) {
            setLastPeriodStart(d.toISOString().split("T")[0]);
          }
        }
        
        setWeight(u.weight ? u.weight.toString() : "");
        setHeight(u.height ? u.height.toString() : "");
        setTargetWeight(u.targetWeight ? u.targetWeight.toString() : "");
        
        if (u.birthDate) {
          const d = new Date(u.birthDate);
          if (!isNaN(d.getTime())) {
            setBirthDate(d.toISOString().split("T")[0]);
          }
        }
        
        setActivityLevel(u.activityLevel || "MODERATELY_ACTIVE");
        setDailyWaterGoal(u.dailyWaterGoal || 2000);
        setDailyCalorieGoal(u.dailyCalorieGoal || 2000);
        setDietPlanEnabled(u.dietPlanEnabled || false);
        setDietType(u.dietType || "NON_VEGETARIAN");
        setIsLactoseIntolerant(u.isLactoseIntolerant || false);
        setIsGlutenFree(u.isGlutenFree || false);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status, fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.appToken) return;
    
    // Strict validations on fields and dates
    const parsedWeight = weight ? parseFloat(weight) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    const parsedTargetWeight = targetWeight ? parseFloat(targetWeight) : null;
    const parsedCalorie = dailyCalorieGoal ? parseInt(dailyCalorieGoal.toString()) : null;
    const parsedWater = dailyWaterGoal ? parseInt(dailyWaterGoal.toString()) : null;
    const parsedCycle = cycleLength ? parseInt(cycleLength.toString()) : null;

    // Field presence and name checks
    if (!name || name.trim().length === 0) {
      return alert("❌ Display name is required and cannot be blank.");
    }

    // Comprehensive birthDate (DOB) validations (no future date)
    if (!birthDate) {
      return alert("❌ Birth date (DOB) is required.");
    }
    const parsedBirth = new Date(birthDate);
    if (isNaN(parsedBirth.getTime())) {
      return alert("❌ Please enter a valid birth date.");
    }
    if (parsedBirth > new Date()) {
      return alert("❌ Birth date cannot be in the future.");
    }
    if (parsedBirth < new Date("1900-01-01")) {
      return alert("❌ Birth date must be after January 1st, 1900.");
    }

    // Gender specific period date validation
    if (gender === "FEMALE" && lastPeriodStart) {
      const parsedPeriod = new Date(lastPeriodStart);
      if (isNaN(parsedPeriod.getTime())) {
        return alert("❌ Please enter a valid last period start date.");
      }
      if (parsedPeriod > new Date()) {
        return alert("❌ Last period start date cannot be in the future.");
      }
      const diffTime = Math.abs(new Date().getTime() - parsedPeriod.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        return alert("❌ Last period start date cannot be more than 1 year ago.");
      }
    }

    // Strict numerical bounds validation
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 500)) {
      return alert("❌ Please enter a valid weight between 20 kg and 500 kg.");
    }
    if (parsedHeight !== null && (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 300)) {
      return alert("❌ Please enter a valid height between 50 cm and 300 cm.");
    }
    if (parsedTargetWeight !== null && (isNaN(parsedTargetWeight) || parsedTargetWeight < 20 || parsedTargetWeight > 500)) {
      return alert("❌ Please enter a valid target weight between 20 kg and 500 kg.");
    }
    if (parsedCalorie !== null && (isNaN(parsedCalorie) || parsedCalorie < 500 || parsedCalorie > 10000)) {
      return alert("❌ Please enter a valid daily calorie goal between 500 kcal and 10,000 kcal.");
    }
    if (parsedWater !== null && (isNaN(parsedWater) || parsedWater < 500 || parsedWater > 10000)) {
      return alert("❌ Please enter a valid daily water goal between 500 ml and 10,000 ml.");
    }
    if (gender === "FEMALE" && parsedCycle !== null && (isNaN(parsedCycle) || parsedCycle < 10 || parsedCycle > 100)) {
      return alert("❌ Please enter a valid cycle length between 10 and 100 days.");
    }

    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          name,
          gender: gender || null,
          cycleLength: gender === "FEMALE" ? cycleLength : null,
          lastPeriodStart: gender === "FEMALE" ? (lastPeriodStart || null) : null,
          weight: parsedWeight,
          height: parsedHeight,
          targetWeight: parsedTargetWeight,
          birthDate: birthDate ? new Date(birthDate) : null,
          activityLevel,
          dailyWaterGoal: parsedWater,
          dailyCalorieGoal: parsedCalorie,
          dietPlanEnabled,
          dietType,
          isLactoseIntolerant,
          isGlutenFree,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (res.ok) {
        const data = await res.json();
        try {
          await updateSession();
        } catch (sessErr) {
          console.error("Session update error:", sessErr);
        }
        setToast("✨ Profile successfully synced!");
        
        // If they completed onboarding, take them straight to dashboard now!
        if (isOnboarding) {
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          setTimeout(() => setToast(null), 3000);
        }
      } else {
        const errorData = await res.json();
        setToast(`❌ Failed: ${errorData.error || "Update rejected."}`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToast("❌ Error saving profile details.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Target Weight Forecast logic
  const getWeightForecast = () => {
    const curW = parseFloat(weight);
    const tarW = parseFloat(targetWeight);
    if (!isNaN(curW) && !isNaN(tarW) && curW > 0 && tarW > 0) {
      const diff = Math.abs(curW - tarW);
      if (diff === 0) return null;
      const weeks = diff / 0.5; // safe 0.5 kg per week pace
      const days = Math.round(weeks * 7);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const dateString = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return { weeks: weeks.toFixed(1), dateString, days, targetWeight: tarW };
    }
    return null;
  };

  const forecast = getWeightForecast();

  const handleDownloadReminder = () => {
    if (!forecast) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + forecast.days);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${yyyy}${mm}${dd}T090000`,
      `DTEND:${yyyy}${mm}${dd}T100000`,
      "SUMMARY:FitSaaS: Reach Weight Goal target!",
      `DESCRIPTION:Friendly reminder to reach your target weight of ${forecast.targetWeight} kg. Safe healthy pacing target completed!`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fitsaas-weight-target.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Indian Protein meal generator
  const getIndianDietMeals = (type: string, lactose: boolean, gluten: boolean, calories: number) => {
    let breakfast = "";
    let lunch = "";
    let snack = "";
    let dinner = "";
    let proteinSource = "";

    if (type === "VEGAN") {
      proteinSource = "Tofu, Roasted Chana, Soya, Moong Sprouts";
      breakfast = `Moong Dal Chilla stuffed with high-protein crumbled Tofu ${gluten ? "(Gluten-Free)" : ""}, mixed salad & roasted almonds.`;
      lunch = `High-protein Chickpea (Chole) salad bowl with brown rice, sautéed spinach, and warm spiced Dal.`;
      snack = `Roasted Peanut Chaat with cucumber, tomatoes, lemon juice, organic soy milk or raw pumpkin seeds.`;
      dinner = `Vegan Tofu & Broccoli curry cooked in cold-pressed mustard oil, thick lentil soup (Masoor dal).`;
    } else if (type === "VEGETARIAN") {
      proteinSource = lactose ? "Tofu, Tempeh, Soya, Split Lentils" : "Paneer, Curd, Greek Yogurt, Whey Protein";
      breakfast = lactose 
        ? `High-protein Tofu Scramble with green chutney, almonds, and raw Moong sprouts.`
        : `Spiced Paneer Bhurji (120g) made in pure ghee, sautéed spinach, and 1 multigrain chila ${gluten ? "(Gluten-Free)" : "or toast"}.`;
      lunch = lactose
        ? `Soya chunks masala curry, yellow split dal tadka, brown rice, cucumber salad.`
        : `Dal Makhani with Paneer Tikka (150g), carrot cucumber raita, raw salad ${gluten ? "(Gluten-Free millet roti)" : "with 2 phulkas"}.`;
      snack = lactose
        ? `Roasted foxnuts (Makhana) with walnuts, water or almond milk.`
        : `Greek Yogurt (150g) or Whey protein shake, walnuts, blueberries & pumpkin seeds.`;
      dinner = lactose
        ? `Tempeh & vegetable stir-fry, high-protein horsegram dal, spinach salad.`
        : `Grilled Paneer Tikka skewers with bell peppers & onions, hot split red lentil soup, roasted broccoli.`;
    } else {
      // Non-Vegetarian
      proteinSource = lactose ? "Egg whites, Grilled Chicken, Fish, Yellow Dal" : "Egg whites, Chicken breast, Salmon, Curd";
      breakfast = `Egg white Bhurji (4 egg whites, 1 whole egg) with onion, tomato & coriander, toasted bread ${gluten ? "(Gluten-Free bread)" : ""}.`;
      lunch = `Tandoori Chicken Breast (150g), yellow tadka dal, organic brown rice, mixed green salad.`;
      snack = lactose
        ? `Roasted chana (chickpeas) with 1 boiled egg white and almonds.`
        : `Whey protein shake, handful of roasted foxnuts (Makhana), 1 whole boiled egg.`;
      dinner = `Baked Salmon or Indian Chicken Breast curry (180g), hot red lentil soup, raw cucumber strips.`;
    }

    const ratio = calories / 2000;
    const bKcal = Math.round(450 * ratio);
    const lKcal = Math.round(650 * ratio);
    const sKcal = Math.round(250 * ratio);
    const dKcal = Math.round(650 * ratio);

    return [
      { name: "🌅 Breakfast", desc: breakfast, kcal: bKcal },
      { name: "🍛 Lunch", desc: lunch, kcal: lKcal },
      { name: "🥜 High-Protein Snack", desc: snack, kcal: sKcal },
      { name: "🌌 Dinner", desc: dinner, kcal: dKcal },
      { name: "💪 Major Protein Sources", desc: proteinSource, kcal: null }
    ];
  };

  const dietPlan = getIndianDietMeals(dietType, isLactoseIntolerant, isGlutenFree, dailyCalorieGoal);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Onboarding Welcome Panel */}
      {isOnboarding && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-emerald-500 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">👋</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider">Welcome to FitSaaS! Let's calibrate your dashboard</h3>
              <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400/80">
                Please complete your personal characteristics below. We use these metrics to dynamically calibrate your daily calorie/water targets, target weight milestone forecasts, tailored Indian high-protein diets, and phase-specific cycle workouts. You can always update these details later!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-16 h-16 rounded-2xl border-2 border-emerald-400/20 object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border-2 border-brand-500/20 flex items-center justify-center font-black text-2xl text-emerald-400">
              {name.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{name || "User Profile"}</h1>
            <p className="text-foreground/60 text-sm mt-1">{session?.user?.email}</p>
          </div>
        </div>
        {image && image.includes("googleusercontent.com") && (
          <div className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border px-3 text-xs font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Google Connected
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Characteristics */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider border-b border-border pb-3">Personal Metrics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  max={todayStr}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setHeight(val);
                  }}
                  placeholder="175"
                  min="0"
                  max="250"
                  step="1"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setWeight(val);
                  }}
                  placeholder="72.5"
                  min="0"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Gender Identification</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                required
              >
                <option value="" disabled className="bg-card">Select gender...</option>
                <option value="MALE" className="bg-card">Male</option>
                <option value="FEMALE" className="bg-card">Female</option>
                <option value="OTHER" className="bg-card">Other</option>
                <option value="PREFER_NOT_TO_SAY" className="bg-card">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Card 2: Fitness Goals & Guidelines */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider border-b border-border pb-3">Fitness & Lifestyle</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setTargetWeight(val);
                  }}
                  placeholder="68.0"
                  min="0"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                >
                  <option value="SEDENTARY" className="bg-card">Sedentary (Little/no exercise)</option>
                  <option value="LIGHTLY_ACTIVE" className="bg-card">Light (1-3 days/wk)</option>
                  <option value="MODERATELY_ACTIVE" className="bg-card">Moderate (3-5 days/wk)</option>
                  <option value="VERY_ACTIVE" className="bg-card">Active (6-7 days/wk)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={dailyCalorieGoal}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) setDailyCalorieGoal(parseInt(val) || 0);
                  }}
                  placeholder="2200"
                  min="0"
                  max="10000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Daily Water Target (ml)</label>
                <input
                  type="number"
                  value={dailyWaterGoal}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) setDailyWaterGoal(parseInt(val) || 0);
                  }}
                  placeholder="2500"
                  min="0"
                  max="20000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dietPlanEnabled"
                  checked={dietPlanEnabled}
                  onChange={(e) => setDietPlanEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-brand-500 bg-background"
                />
                <label htmlFor="dietPlanEnabled" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 cursor-pointer">
                  Enable Diet Customizer
                </label>
              </div>
              {dietPlanEnabled && (
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Weight Forecast Reminder Box */}
        {forecast && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Weight Target Forecast</h3>
              </div>
              <span className="text-xs font-bold bg-brand-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Safe 0.5 kg/week pace
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  You are estimated to reach your target weight of <strong className="text-emerald-500">{forecast.targetWeight} kg</strong> in{" "}
                  <strong className="text-emerald-500">{forecast.weeks} weeks</strong>!
                </p>
                <p className="text-xs text-foreground/60">
                  Target milestone date: <strong className="text-foreground">{forecast.dateString}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadReminder}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-border px-4 text-xs font-bold text-emerald-500 transition-colors"
              >
                📅 Add Calendar Reminder
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Indian Protein Diet Selection */}
        {dietPlanEnabled && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍛</span>
                <h3 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Indian High-Protein Diet Plan</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="lactoseToggle"
                    checked={isLactoseIntolerant}
                    onChange={(e) => setIsLactoseIntolerant(e.target.checked)}
                    className="h-3 w-3 rounded text-emerald-500 focus:ring-brand-500"
                  />
                  <label htmlFor="lactoseToggle" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 cursor-pointer">
                    Lactose-Free
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="glutenToggle"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="h-3 w-3 rounded text-emerald-500 focus:ring-brand-500"
                  />
                  <label htmlFor="glutenToggle" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 cursor-pointer">
                    Gluten-Free
                  </label>
                </div>
              </div>
            </div>

            <p className="text-xs text-foreground/60 leading-relaxed">
              Based on your custom daily calorie budget of <strong className="text-foreground">{dailyCalorieGoal} kcal</strong>, 
              here is your tailored High-Protein Indian Meal Plan recommendations:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {dietPlan.map((d, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">{d.name}</span>
                      {d.kcal && (
                        <span className="text-[10px] font-bold bg-brand-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                          {d.kcal} kcal
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-2 leading-relaxed text-foreground/80">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 3: Women's Health (Conditional) */}
        {gender === "FEMALE" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xl">🌸</span>
              <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Women's Health Integration</h2>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Dynamically maps hormonal cycle changes to optimize workout suggestions on your primary command dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Average Cycle Length (Days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) setCycleLength(parseInt(val) || 0);
                  }}
                  placeholder="28"
                  min="0"
                  max="45"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Last Period Start Date</label>
                <input
                  type="date"
                  value={lastPeriodStart}
                  max={todayStr}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Syncing details..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
