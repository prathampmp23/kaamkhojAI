import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary-subtle text-black text-start p-2">
      <Container className="d-flex justify-content-between gap-4">
        <div>
          <p>
            <b>&copy; {new Date().getFullYear()} {t("footer.companyName")}.</b>{" "}
            {t("footer.rights")}.
          </p>
        </div>
        <div>
          <p>
            <b>Co-Founders </b>
          </p>
          <p className="text-primary">
            Manthan, Pratham, Rishabh, Yachin, Aashish
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
