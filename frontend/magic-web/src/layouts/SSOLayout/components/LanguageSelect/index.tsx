import MagicIcon from "@/components/base/MagicIcon"
import { IconWorld } from "@tabler/icons-react"
import MagicSelect from "@/components/base/MagicSelect"
import { isLanguageSwitchEnabled } from "@/models/config/languagePolicy"
import {
	setGlobalLanguage,
	useGlobalLanguage,
	useSupportLanguageOptions,
	useTheme,
} from "@/models/config/hooks"
import { cn } from "@/lib/utils"

function LanguageSelect() {
	const options = useSupportLanguageOptions()
	const lang = useGlobalLanguage()
	const { prefersColorScheme } = useTheme()
	const isDarkMode = prefersColorScheme === "dark"
	if (!isLanguageSwitchEnabled()) return null

	return (
		<MagicSelect
			prefix={
				<MagicIcon component={IconWorld} size={20} color={isDarkMode ? "#f5f5f5" : "#111827"} />
			}
			value={lang}
			className={cn(
				"w-fit rounded-full border border-border bg-background/90 px-2 py-[5px] text-foreground shadow-sm backdrop-blur-sm",
				"hover:bg-accent/60 dark:bg-background/80 dark:hover:bg-accent/50",
			)}
			options={options}
			variant="borderless"
			placement="bottomRight"
			onChange={setGlobalLanguage}
			dataTestId="language-select"
			classNames={{
				popup: {
					root: "min-w-fit [&>*:not(:first-child)]:mt-1",
				},
			}}
		/>
	)
}

export default LanguageSelect
