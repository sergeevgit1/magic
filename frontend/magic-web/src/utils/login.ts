import { env, isPrivateDeployment } from "@/utils/env"
import { Login } from "@/types/login"

export const isEmailVerificationEnabled = (): boolean => env("MAGIC_EMAIL_VERIFICATION_ENABLED") !== "false"

export const getDefaultOrganizationCodeForRegistration = (): string => {
	if (!isPrivateDeployment()) return ""
	try {
		const raw = env("MAGIC_PRIVATE_DEPLOYMENT_CONFIG")
		if (!raw) return ""
		const parsed = JSON.parse(raw)
		return parsed?.organization_code || parsed?.organizationCode || ""
	} catch {
		return ""
	}
}

export const shouldUseDirectEmailRegistration = (): boolean => !isEmailVerificationEnabled()
export const isRecoverPasswordAvailable = (): boolean => isEmailVerificationEnabled()
export const getDefaultLoginTypeFallback = (): Login.LoginType => Login.LoginType.EmailPassword
