import React from 'react';

export interface GameCardProps {
  title: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category: string;
  description?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  price,
  stock,
  imageUrl,
  category,
  description,
}) => {
  const isAvailable = stock > 0;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const formattedPrice = isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);

  return (
    <article className="game-card">
      <div className="game-card-image-wrapper">
        <img
          src={imageUrl || 'https://placehold.co/300x180?text=No+Cover'}
          alt={title}
          className="game-card-img"
          loading="lazy"
        />
        <span className="game-badge">{category}</span>
      </div>
      <div className="game-card-body">
        <h3 className="game-title">{title}</h3>
        {description && <p className="game-desc">{description}</p>}
        <div className="game-card-footer">
          <span className="game-price">${formattedPrice}</span>
          <span className={`stock-status ${isAvailable ? 'in-stock' : 'out-stock'}`}>
            {isAvailable ? `${stock} disp.` : 'Agotado'}
          </span>
        </div>
      </div>
    </article>
  );
};