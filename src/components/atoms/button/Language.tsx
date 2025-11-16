import i18n from "../../../i18n";
import { LanguageOptions } from "../../../constants/enum";
import SingleToggleButtonGroup from "../SingleToggleButtonGroup";

function LanguageButton() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <p className="text-sm">Language</p>
      <SingleToggleButtonGroup
        options={Object.values(LanguageOptions)}
        value={i18n.language as LanguageOptions}
        onChange={(lang) => i18n.changeLanguage(lang)}
        getLabel={(language) => language.toUpperCase()}
        buttonClassName="min-w-[50px]"
      />
    </div>
  );
}

export default LanguageButton;
