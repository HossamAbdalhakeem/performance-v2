<template>
  <div>
    <main
      class="min-h-screen bg-stone-50 text-slate-900 lg:grid lg:grid-cols-[0.9fr_1.1fr]"
    >
      <section
        class="relative isolate overflow-hidden bg-emerald-950 px-7 py-10 text-white sm:px-12 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-[clamp(3rem,8vw,8rem)]"
      >
        <div
          class="absolute -right-32 -bottom-36 -z-10 h-[28rem] w-[28rem] rounded-full border border-emerald-300/20 shadow-[0_0_0_2rem_rgba(167,243,208,0.05),0_0_0_5rem_rgba(167,243,208,0.04)]"
          aria-hidden="true"
        ></div>
        <div
          class="mb-16 grid size-12 place-items-center rounded-full border border-emerald-100/60 font-serif text-2xl sm:mb-24"
        >
          F
        </div>
        <p
          class="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-300"
        >
          GiveSpark
        </p>
        <h1
          class="max-w-xl font-serif text-5xl font-normal leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl"
        >
          Make every contribution count.
        </h1>
        <p class="mt-7 max-w-md text-base leading-7 text-emerald-100/80">
          Bring your campaigns, creators, and community together in one clear
          view.
        </p>
        <div class="mt-12 flex items-center" aria-hidden="true">
          <span class="h-px w-24 bg-emerald-300/70"></span>
          <span
            class="mx-4 size-2 rounded-full border-2 border-emerald-200"
          ></span>
          <span class="h-px w-16 bg-emerald-300/70"></span>
        </div>
        <p class="mt-6 font-serif text-sm italic text-emerald-200/80">
          “The clearest path from an idea to a movement.”
        </p>
      </section>

      <section
        class="flex min-h-screen flex-col justify-between px-7 py-10 sm:px-12 lg:px-[clamp(3rem,9vw,9.5rem)] lg:py-16"
        aria-labelledby="login-title"
      >
        <div class="m-auto w-full max-w-[27rem]">
          <div class="mb-10">
            <p
              class="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-800"
            >
              Welcome back
            </p>
            <h2
              id="login-title"
              class="font-serif text-4xl font-normal leading-tight tracking-normal text-slate-900 sm:text-[2.65rem]"
            >
              Sign in to your account
            </h2>
            <p class="mt-3 text-sm text-slate-500">
              Pick up where you left off.
            </p>
          </div>

          <form class="space-y-6" novalidate @submit.prevent="submitForm">
            <div class="flex flex-col gap-2">
              <label for="email" class="text-sm font-semibold text-slate-800"
                >Email address</label
              >
              <InputText
                id="email"
                v-model.trim="form.email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                :invalid="Boolean(errors.email)"
                fluid
                @blur="validateEmail"
              />
              <small
                v-if="errors.email"
                class="text-xs text-red-700"
                role="alert"
                >{{ errors.email }}</small
              >
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-4">
                <label
                  for="password"
                  class="text-sm font-semibold text-slate-800"
                  >Password</label
                >
                <a
                  href="#forgot-password"
                  class="text-xs font-semibold text-emerald-800 hover:underline"
                  >Forgot password?</a
                >
              </div>
              <Password
                input-id="password"
                v-model="form.password"
                name="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                :invalid="Boolean(errors.password)"
                :feedback="false"
                toggle-mask
                fluid
                @blur="validatePassword"
              />
              <small
                v-if="errors.password"
                class="text-xs text-red-700"
                role="alert"
                >{{ errors.password }}</small
              >
            </div>

            <div class="flex items-center gap-2">
              <Checkbox v-model="rememberMe" input-id="remember" binary />
              <label for="remember" class="text-sm text-slate-600"
                >Remember me</label
              >
            </div>
            <Button
              type="submit"
              label="Sign in"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :loading="isSubmitting"
              fluid
              class="!h-14 !justify-between !rounded-sm !border-0 !bg-emerald-800 !px-6 !font-semibold hover:!bg-emerald-950"
            />
          </form>

          <p class="mt-9 text-center text-sm text-slate-500">
            New to Fundraiser?
            <a
              href="#create-account"
              class="font-bold text-emerald-800 hover:underline"
              >Create an account</a
            >
          </p>
        </div>
        <p
          class="mx-auto mt-10 w-full max-w-[27rem] text-center text-[0.7rem] leading-5 text-slate-500"
        >
          By continuing, you agree to our
          <a href="#terms" class="font-bold text-emerald-800 hover:underline"
            >Terms</a
          >
          and
          <a href="#privacy" class="font-bold text-emerald-800 hover:underline"
            >Privacy Policy</a
          >.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import { useAuthStore } from "~/store/Auth.js";

import { reactive, ref } from "vue";
const form = reactive({ email: "", password: "" });
const errors = reactive({ email: "", password: "" });
const rememberMe = ref(false);
const isSubmitting = ref(false);

const validateEmail = () => {
  errors.email = form.email
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ""
      : "Enter a valid email address."
    : "Email is required.";
};

const validatePassword = () => {
  errors.password = form.password ? "" : "Password is required.";
};
const router = useRouter();

const submitForm = async () => {
    console.log('Submitting login form with:');
    
  validateEmail();
  validatePassword();
  if (errors.email || errors.password) return;

  isSubmitting.value = true;
  const authStore = useAuthStore();
  const response = await authStore.login({  
    username: form.email,
    password: form.password,
  });
  console.log("Login response: status", response?.status);

  // if (response?.status === 'SUCCESS') {
  //   // Handle successful login, e.g., redirect to dashboard
  //   router.push("/");
  // } else {
  //   // Handle login error, e.g., show error message
  // }
  isSubmitting.value = false;
};
</script>