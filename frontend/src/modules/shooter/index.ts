import { registerModule } from "../../core/modulesRegistry";
import { ShooterPage } from "./pages/ShooterPage";

registerModule({
  id: "shooter",
  name: "Shooters",
  category: "traditional",
  component: ShooterPage,
  layout: "full-width",
});
