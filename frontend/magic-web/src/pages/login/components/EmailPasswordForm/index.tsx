import { Form } from "antd"
import { useTranslation } from "react-i18next"
import type { LoginPanelProps } from "@/types/login"
import { Login } from "@/types/login"
import { useDebounceFn, useMemoizedFn } from "ahooks"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import type { OnSubmitFn } from "@/pages/login/types"
import { LoginValueKey } from "../../constants"
import { getDeviceInfo } from "@/utils/devices"
import { useLoginServiceContext } from "../../../../layouts/SSOLayout/providers/LoginServiceProvider"
import type { LoginService } from "@/services/user/LoginService"
import { Button } from "@/components/shadcn-ui/button"
import { Input as ShadcnInput } from "@/components/shadcn-ui/input"
import VerificationCodeButton from "@/components/business/VerificationCodeButton"
import { VerificationCode } from "@/constants/bussiness"
import { UserApi } from "@/apis"
import magicToast from "@/components/base/MagicToaster/utils"
import { getDefaultOrganizationCodeForRegistration, isRecoverPasswordAvailable, shouldUseDirectEmailRegistration } from "@/utils/login"

interface EmailAuthFormValues {
	email: string
	password: string
	confirmPassword?: string
	verificationCode?: string
	redirect: string
	type: Login.LoginType
}

type EmailAuthMode = "login" | "register" | "recover"

interface PasswordFormProps extends LoginPanelProps {
	onSubmit: OnSubmitFn<Login.LoginType.EmailPassword>
}

export default function EmailPasswordForm(props: PasswordFormProps) {
	const { onSubmit, onError } = props
	const { t, i18n } = useTranslation("login")
	const { service } = useLoginServiceContext()
	const [form] = Form.useForm<EmailAuthFormValues>()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [mode, setMode] = useState<EmailAuthMode>("login")
	const [submitting, setSubmitting] = useState(false)
	const emailValue = Form.useWatch<string>(LoginValueKey.EMAIL, form)

	const resetForMode = useMemoizedFn((nextMode: EmailAuthMode) => {
		const email = form.getFieldValue(LoginValueKey.EMAIL) || ""
		setMode(nextMode)
		form.resetFields()
		form.setFieldsValue({
			email,
			password: "",
			confirmPassword: "",
			verificationCode: "",
			type: Login.LoginType.EmailPassword,
			redirect: window.location.href,
		})
	})

	const loginWithPassword = useMemoizedFn(async (email: string, password: string) => {
		const device = await getDeviceInfo(i18n)
		const response = await service
			.get<LoginService>("loginService")
			.login(Login.LoginType.EmailPassword, {
				email,
				password,
				redirect: window.location.href,
				type: Login.LoginType.EmailPassword,
				device,
			})
		onSubmit(response, Login.LoginType.EmailPassword, {
			email,
			password,
			redirect: window.location.href,
			type: Login.LoginType.EmailPassword,
		})
	})

	const { run: handleSubmit } = useDebounceFn(
		useMemoizedFn(async () => {
			try {
				setSubmitting(true)
				const values = await form.validateFields()
				const email = values.email
				const password = values.password
				const verificationCode = values.verificationCode || ""

				if (mode === "login") {
					await loginWithPassword(email, password)
					return
				}

				if (mode === "register") {
					if (shouldUseDirectEmailRegistration()) {
						const organizationCode = getDefaultOrganizationCodeForRegistration()
						await service
							.get<LoginService>("loginService")
							.registerByEmail(email, password, organizationCode)
						await loginWithPassword(email, password)
						return
					}

					const device = await getDeviceInfo(i18n)
					await service
						.get<LoginService>("loginService")
						.login(Login.LoginType.EmailVerificationCode, {
							email,
							captcha: verificationCode,
							auto_register: true,
							redirect: window.location.href,
							type: Login.LoginType.EmailVerificationCode,
							device,
						})
					await UserApi.changePassword(verificationCode, password, password)
					await loginWithPassword(email, password)
					return
				}

				if (!isRecoverPasswordAvailable()) {
					magicToast.error(t("passwordRecoveryUnavailable"))
					return
				}
				await UserApi.changePassword(verificationCode, password, password)
				magicToast.success(t("passwordResetSuccess"))
				resetForMode("login")
			} catch (error) {
				onError?.(error)
			} finally {
				setSubmitting(false)
			}
		}),
		{ wait: 200 },
	)

	const onKeyDown = useMemoizedFn((event) => {
		if (event.key === "Enter") handleSubmit()
	})

	const modeTitle =
		mode === "login"
			? t("emailPasswordLogin")
			: mode === "register"
				? t("createAccount")
				: t("findPassword")

	const showVerification = mode !== "login" && (mode !== "register" || !shouldUseDirectEmailRegistration())

	return (
		<div className="flex w-full flex-col">
			<div className="mb-4 flex items-center gap-2 text-sm">
				<button
					type="button"
					onClick={() => resetForMode("login")}
					className={
						mode === "login" ? "font-semibold text-foreground" : "text-foreground/60"
					}
				>
					{t("emailPasswordLogin")}
				</button>
				<span className="text-foreground/30">/</span>
				<button
					type="button"
					onClick={() => resetForMode("register")}
					className={
						mode === "register" ? "font-semibold text-foreground" : "text-foreground/60"
					}
				>
					{t("createAccount")}
				</button>
				<span className="text-foreground/30">/</span>
				{isRecoverPasswordAvailable() ? (
					<button
						type="button"
						onClick={() => resetForMode("recover")}
						className={
							mode === "recover" ? "font-semibold text-foreground" : "text-foreground/60"
						}
					>
						{t("findPassword")}
					</button>
				) : null}
			</div>

			<Form
				layout="vertical"
				form={form}
				initialValues={{
					email: "",
					password: "",
					confirmPassword: "",
					verificationCode: "",
					type: Login.LoginType.EmailPassword,
					redirect: window.location.href,
				}}
				onFinish={handleSubmit}
				preserve={false}
				className="w-full"
				data-testid="email-auth-form"
			>
				<div className="flex w-full flex-col gap-5">
					<Form.Item hidden name={LoginValueKey.REDIRECT_URL} />
					<Form.Item
						label={t("email.label")}
						name={LoginValueKey.EMAIL}
						rules={[
							{ required: true, message: t("email.required") },
							{ type: "email", message: t("email.required") },
						]}
						className="mb-0 w-full"
					>
						<ShadcnInput
							type="email"
							placeholder={t("email.placeholder")}
							onKeyDown={onKeyDown}
							autoComplete="email"
							className="h-10 rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-foreground/55 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30 dark:hover:bg-input/50"
							data-testid="email-input"
						/>
					</Form.Item>

					{showVerification ? (
						<Form.Item
							label={t("verificationCode")}
							name="verificationCode"
							rules={[
								{ required: true, message: t("email.verificationCodeRequired") },
							]}
							className="mb-0 w-full"
						>
							<div className="flex items-center gap-2">
								<ShadcnInput
									placeholder={t("email.verificationCodeRequired")}
									onKeyDown={onKeyDown}
									className="h-10 rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-foreground/55 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30 dark:hover:bg-input/50"
								/>
								<VerificationCodeButton
									phone={emailValue}
									size="small"
									className="h-10 whitespace-nowrap"
									codeType={
										mode === "register"
											? VerificationCode.RegisterAccount
											: VerificationCode.ChangePassword
									}
									trigger={(codeType, value, _stateCode, token) =>
										service
											.get<LoginService>("loginService")
											.sendEmailVerificationCode(value, codeType, token || "")
									}
									disabled={!emailValue}
								/>
							</div>
						</Form.Item>
					) : null}

					<Form.Item
						label={mode === "recover" ? t("newPassword") : t("password.label")}
						className="mb-0 w-full"
					>
						<div className="relative">
							<Form.Item
								noStyle
								name={LoginValueKey.PASSWORD}
								rules={[{ required: true, message: t("password.placeholder") }]}
							>
								<ShadcnInput
									type={showPassword ? "text" : "password"}
									placeholder={t("password.placeholder")}
									onKeyDown={onKeyDown}
									autoComplete={
										mode === "login" ? "current-password" : "new-password"
									}
									className="h-10 rounded-md border border-input bg-background px-4 pr-10 text-sm text-foreground placeholder:text-foreground/55 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30 dark:hover:bg-input/50"
									data-testid="password-input"
								/>
							</Form.Item>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground"
								aria-label={showPassword ? t("password.hide") : t("password.show")}
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</Form.Item>

					{showVerification ? (
						<Form.Item
							label={t("confirmPassword")}
							name="confirmPassword"
							dependencies={[LoginValueKey.PASSWORD]}
							rules={[
								{ required: true, message: t("confirmPassword") },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (
											!value ||
											getFieldValue(LoginValueKey.PASSWORD) === value
										) {
											return Promise.resolve()
										}
										return Promise.reject(new Error(t("passwordsDoNotMatch")))
									},
								}),
							]}
							className="mb-0 w-full"
						>
							<div className="relative">
								<ShadcnInput
									type={showConfirmPassword ? "text" : "password"}
									placeholder={t("confirmPassword")}
									onKeyDown={onKeyDown}
									autoComplete="new-password"
									className="h-10 rounded-md border border-input bg-background px-4 pr-10 text-sm text-foreground placeholder:text-foreground/55 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30 dark:hover:bg-input/50"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground"
									aria-label={
										showConfirmPassword
											? t("password.hide")
											: t("password.show")
									}
								>
									{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</Form.Item>
					) : null}

					<Button
						type="button"
						className="h-10 w-full rounded-md px-4 text-sm font-semibold"
						onClick={handleSubmit}
						disabled={submitting}
						data-testid="email-auth-submit"
					>
						{modeTitle}
					</Button>
				</div>
			</Form>
		</div>
	)
}
