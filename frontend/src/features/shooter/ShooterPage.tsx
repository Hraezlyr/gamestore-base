import { useState } from "react";

import { GameDetail } from "./GameDetail";
import { ShooterCatalog } from "./ShooterCatalog";

import "./shooter.css";

export function ShooterPage() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <main className="shooter-page">
            <div hidden={selectedId !== null}>
                <ShooterCatalog onSelect={setSelectedId} />
            </div>

            {selectedId !== null && (
                <GameDetail
                    key={selectedId}
                    id={selectedId}
                    onBack={() => setSelectedId(null)}
                />
            )}
        </main>
    );
}