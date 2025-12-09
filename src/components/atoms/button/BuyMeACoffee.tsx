/**
 * BuyMeACoffee Button (for sponsor)
 */
function BuyMeACoffeeButton() {
  return (
    <div className="flex justify-center">
      <a
        href="https://buymeacoffee.com/haulrest"
        target="_blank"
        rel="noreferrer"
        className="mt-10 mb-2.5 inline-block"
      >
        <img src="./bmc-button.png" alt="buy me a coffee" width={200} />
      </a>
    </div>
  );
}

export default BuyMeACoffeeButton;
