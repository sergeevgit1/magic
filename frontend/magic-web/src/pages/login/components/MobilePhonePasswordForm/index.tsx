import { Form } from "antd"
import { useTranslation } from "react-i18next"
import type { LoginPanelProps } from "@/types/login"
import { Login } from "@/types/login"
import { useDebounceFn, useMemoizedFn } from "ahooks"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { LoginFormValuesMap, OnSubmitFn } from "@/pages/login/types"
import { LoginValueKey } from "../../constants"
import PhoneInputFormItem from "../PhoneInputFormItem"
import { getDeviceInfo } from "@/utils/devices"
import { useLoginServiceContext } from "../../../../layouts/SSOLayout/providers/LoginServiceProvider"
import { useAreaCodes, useGlobalLanguage } from "@/models/config/hooks"
import type { LoginService } from "@/services/user/LoginService"
import { Button } from "@/components/shadcn-ui/button"
import { Input as ShadcnInput } from "@/components/shadcn-ui/input"

const FALLBACK_PHONE_STATE_CODE = "+1"

const resolveDefaultPhoneStateCode = (
areaCodes: Array<{ code: string }>,
language: string,
): string => {
const preferredCodes = language === "ru_RU" ? ["+7", "+1"] : ["+1", "+7"]

for (const code of preferredCodes) {
if (areaCodes.some((item) => item.code === code)) return code
}

return areaCodes[0]?.code || FALLBACK_PHONE_STATE_CODE
}

interface PasswordFormProps extends LoginPanelProps {
onSubmit: OnSubmitFn<Login.LoginType.MobilePhonePassword>
}

export default function MobilePhonePasswordForm(props: PasswordFormProps) {
const { onSubmit, onError } = props
const { t, i18n } = useTranslation("login")
const { service } = useLoginServiceContext()
const { areaCodes } = useAreaCodes()
const language = useGlobalLanguage(false)
const [form] = Form.useForm<LoginFormValuesMap[Login.LoginType.MobilePhonePassword]>()
const [showPassword, setShowPassword] = useState(false)
const defaultPhoneStateCode = useMemo(
() => resolveDefaultPhoneStateCode(areaCodes, language),
[areaCodes, language],
)

const phoneStateCode = Form.useWatch<string>(LoginValueKey.PHONE_STATE_CODE, form)

const { run: handleSubmit } = useDebounceFn(
useMemoizedFn(() => {
form?.validateFields().then(async (values) => {
if (values) {
try {
const device = await getDeviceInfo(i18n)
const response = await service
.get<LoginService>("loginService")
.login(Login.LoginType.MobilePhonePassword, {
...values,
device,
})
onSubmit(response, Login.LoginType.MobilePhonePassword, values)
} catch (error) {
onError?.(error)
}
}
})
}),
{ wait: 200 },
)

const onKeyDown = useMemoizedFn((event) => {
if (event.key === "Enter") {
handleSubmit()
}
})

useEffect(() => {
if (!form.getFieldValue(LoginValueKey.PHONE_STATE_CODE)) {
form.setFieldValue(LoginValueKey.PHONE_STATE_CODE, defaultPhoneStateCode)
}
}, [defaultPhoneStateCode, form])

return (
<div className="flex w-full flex-col">
<Form
layout="vertical"
form={form}
initialValues={{
phone: "",
state_code: defaultPhoneStateCode,
password: "",
type: Login.LoginType.MobilePhonePassword,
redirect: window.location.href,
}}
onFinish={handleSubmit}
preserve={false}
className="w-full"
data-testid="password-login-form"
>
<div className="flex w-full flex-col gap-5">
<Form.Item hidden name={LoginValueKey.REDIRECT_URL} />
<Form.Item hidden name={LoginValueKey.PHONE_STATE_CODE} />
<PhoneInputFormItem
name={LoginValueKey.PHONE}
label={t("phone.label")}
phoneStateCode={phoneStateCode}
onChangePhoneStateCode={(value) => form?.setFieldValue("state_code", value)}
/>
<Form.Item label={t("password.label")} className="mb-0 w-full">
<div className="relative">
<Form.Item
noStyle
name={LoginValueKey.PASSWORD}
rules={[
{
required: true,
message: t("password.placeholder"),
},
]}
>
<ShadcnInput
type={showPassword ? "text" : "password"}
placeholder={t("password.placeholder")}
onKeyDown={onKeyDown}
autoComplete="current-password"
className="h-10 rounded-md px-4 pr-10 text-sm placeholder:text-muted-foreground"
data-testid="password-input"
/>
</Form.Item>
<button
type="button"
onClick={() => setShowPassword((prev) => !prev)}
className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
data-testid="password-visibility-toggle"
aria-label={showPassword ? t("password.hide") : t("password.show")}
>
{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</Form.Item>
<Button
type="button"
className="h-10 w-full rounded-md px-4 text-sm font-semibold"
onClick={handleSubmit}
data-testid="password-login-submit"
>
{t("login")}
</Button>
</div>
</Form>
</div>
)
}
