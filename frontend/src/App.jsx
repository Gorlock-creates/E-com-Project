
import { Container } from "react-bootstrap";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      {/* Navigation Bar */}
      <Header />

      {/* Main Content */}
      <main className="my-3">
        <Container>
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
