import { MainWrapperSx } from "../../constants/style";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailIcon from "@mui/icons-material/Email";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LanguageButton from "../atoms/button/Language";

function ErrorPage() {
  const { t } = useTranslation();

  return (
    <Box sx={MainWrapperSx} flexDirection="column">
      <Typography variant="h6" sx={{ m: 2 }}>
        {t("frontend.server.error")}
      </Typography>
      <img src="/error.png" alt="error" style={{ width: 200 }} />
      <br />
      <br />
      <Button
        variant="contained"
        sx={{ mr: 2 }}
        onClick={() => window.location.reload()}
        endIcon={<RefreshIcon />}
      >
        Refresh
      </Button>
      <Button
        variant="contained"
        href="mailto:haulrest@gmail.com"
        target="_blank"
        endIcon={<EmailIcon />}
      >
        E-mail
      </Button>
      <br />
      <br />
      <br />
      <LanguageButton />
    </Box>
  );
}

export default ErrorPage;
