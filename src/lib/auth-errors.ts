export function mapLoginError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。/signup から新しいメールアドレスで登録し直してください。";
  }

  if (normalized.includes("email not confirmed")) {
    return "メールが未確認です。Supabase の Users で Confirm するか、Confirm email を OFF にしてください。";
  }

  return message;
}

export function mapSignupError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "アカウントは作成済みの可能性があります。ログインを試すか、Supabase の Users で Confirm してください。";
  }

  return message;
}
