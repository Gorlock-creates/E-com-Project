import "./footer.css";

function Footer() {
  let year = new Date().getFullYear();

  return (
    <footer className="footer">
      <h5>Kala Kriti</h5>
      <p>Discover. Create. Share.</p>
      <small>© {year} Kala Kriti. All rights reserved.</small>
    </footer>
  );
}

export default Footer;

