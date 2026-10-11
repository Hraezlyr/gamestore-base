import { registerModule } from "../../core/modulesRegistry";
import { ShooterPage } from "../../features/shooter/pages/ShooterPage";

registerModule({
  id: "shooter",
  name: "Shooters / PC",
  category: "traditional",
  component: ShooterPage,
  layout: "full-width",
});
