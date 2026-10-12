import { useEffect, useState } from 'react';

export default function ModuloAsignado() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/modulo_asignado/')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching terror games:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-white">Cargando catálogo de Terror...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Terror Games Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded border border-red-900 shadow-lg">
            <h2 className="text-xl font-semibold text-white">{item.name || item.title}</h2>
            <p className="text-gray-400 mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}