// src/components/StatsCard.jsx
const StatsCard = ({ title, value, change, isCurrency, isRating, unit }) => {
    const isPositive = change >= 0;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-end justify-between mt-2">
          <p className="text-2xl font-bold text-gray-800">
            {isCurrency && ''}{value}{unit && ` ${unit}`}
          </p>
          {change !== undefined && (
            <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>
        {isRating && (
          <div className="mt-1 flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default StatsCard;