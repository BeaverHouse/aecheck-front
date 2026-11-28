import useCheckStore from "../store/useCheckStore";
import { getNumber } from "../util/func";
import { AECharacterStyles } from "../constants/enum";

/** Ticks characters as owned, with the ★4 version of each NS and each one's buddy. */
export function useAddInven(allCharacters: CharacterSummary[]) {
  const { inven, buddy, setInven, setBuddy } = useCheckStore();

  return (chars: CharacterSummary[]) => {
    const codes = chars
      .filter((char) => char.style === AECharacterStyles.normal)
      .map((char) => char.code);
    const fourStars = allCharacters.filter(
      (c) => c.style === AECharacterStyles.four && codes.includes(c.code),
    );
    setInven([...inven, ...[...chars, ...fourStars].map(getNumber)]);
    setBuddy([
      ...buddy,
      ...chars.flatMap((char) => (char.buddy ? getNumber(char.buddy) : [])),
    ]);
  };
}
