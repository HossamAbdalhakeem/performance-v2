<template>
  <div class="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
    <div class="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div class="grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
        <section class="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-900 p-8 text-white sm:p-10 lg:p-12">
          <div class="absolute inset-0 opacity-20" aria-hidden="true">
            <div class="absolute -right-20 top-10 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
            <div class="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          </div>

          <div class="relative z-10">
            <div class="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold shadow-lg backdrop-blur-sm">د</div>
            <p class="mb-3 text-xs font-semibold tracking-[0.25em] text-sky-200/80">لوحة التحكم</p>
            <h1 class="max-w-md text-4xl font-bold leading-tight sm:text-5xl">نظام إدارة المكتبة</h1>
          </div>

          <div class="relative z-10 space-y-6 text-right">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p class="text-sm text-sky-100">إدارة فروع المكتبة</p>
              <p class="mt-2 text-[2rem] font-bold">24/7</p>
            </div>

            <ul class="space-y-3 text-sm text-sky-100/90">
              <li class="flex items-center gap-3"><span class="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" /> إدارة المبيعات والطلبات</li>
              <li class="flex items-center gap-3"><span class="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" /> متابعة المخزون والحجوزات</li>
              <li class="flex items-center gap-3"><span class="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" /> تقارير دورية وملفات الطلبة</li>
            </ul>
          </div>
        </section>

        <section class="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div class="w-full max-w-md">
            <div class="mb-8 text-right">
              <p class="text-xs font-semibold tracking-[0.22em] text-slate-500">تسجيل الدخول</p>
              <h2 class="mt-3 text-3xl font-bold text-slate-900">مرحباً بعودتك</h2>
            </div>

            <Form v-slot="{ errors: fieldErrors, meta }" @submit="submitLogin" class="space-y-6" :initial-values="initialValues">
              <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
                <div class="flex flex-col gap-2 text-right">
                  <label class="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                  <InputText
                    v-bind="field"
                    v-model="form.email"
                    type="email"
                    placeholder="admin@library.local"
                    class="w-full"
                    :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
                  />
                  <ErrorMessage name="email" class="text-xs text-red-500" />
                </div>
              </Field>

              <Field v-slot="{ field, errorMessage }" name="password" rules="required|min:6">
                <div class="flex flex-col gap-2 text-right">
                  <label class="text-sm font-medium text-slate-700">كلمة المرور</label>
                  <Password
                    v-bind="field"
                    v-model="form.password"
                    toggle-mask
                    :feedback="false"
                    placeholder="••••••••"
                    class="w-full"
                    :input-class="['w-full', { 'p-invalid': errorMessage || fieldErrors.password }]"
                  />
                  <ErrorMessage name="password" class="text-xs text-red-500" />
                </div>
              </Field>

              <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <label class="flex cursor-pointer items-center gap-2">
                  <Checkbox v-model="rememberMe" binary />
                  <span>تذكرني</span>
                </label>
                <button type="button" class="text-sky-700 hover:underline">نسيت كلمة المرور؟</button>
              </div>

              <FormSubmitButton
                :loading="authStore.loading"
                :valid="meta.valid"
                severity="info"
                size="large"
                button-class="w-full justify-center"
              >
                {{ authStore.loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول" }}
              </FormSubmitButton>
            </Form>

            <div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right text-sm text-slate-600">
              <p class="font-semibold text-slate-800">بيانات تجريبية:</p>
              <ul class="mt-2 space-y-2">
                <li>مدير: admin@library.local </li>
                <li>خدمة العملاء: hossamabdalhakeem99+098@gmail.com /hossamabdalhakeem99+099@gmail.com</li>
                <li>موظف فرع: hossamabdalhakeem99+123@gmail.com  /  hossamabdalhakeem99+547@gmail.com</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Checkbox from "primevue/checkbox";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import { useAuthStore } from "~/store/auth.js";
import { useAppToast } from "~/composables/useAppToast";

const authStore = useAuthStore();
const { showError } = useAppToast();
const rememberMe = ref(false);
const form = reactive({
  email: "admin@library.local",
  password: "Password123!",
});

const initialValues = {
  email: "admin@library.local",
  password: "Password123!",
};

definePageMeta({
  middleware: ["local-auth-user"],
  layout: "login",
});

const submitLogin = async () => {
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: rememberMe.value,
    });
  } catch (error) {
    showError(error?.message || "تعذر تسجيل الدخول.");
  }
};
</script>
