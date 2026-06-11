import numpy as np
from sklearn.linear_model import LinearRegression

def predict_next_month(monthly_data: list[dict]) -> float:
    """
    monthly_data: list of {"month": int, "year": int, "qty": float}
    Returns predicted quantity for next month using Linear Regression.
    """
    if not monthly_data:
        return 0.0

    # Sort by year, month
    sorted_data = sorted(monthly_data, key=lambda x: (x["year"], x["month"]))

    if len(sorted_data) < 2:
        # Not enough data — return last known qty
        return float(sorted_data[-1]["qty"])

    # Create sequential time index (1, 2, 3, ...)
    X = np.array(range(1, len(sorted_data) + 1)).reshape(-1, 1)
    y = np.array([d["qty"] for d in sorted_data], dtype=float)

    model = LinearRegression()
    model.fit(X, y)

    # Predict for next time step
    next_t = np.array([[len(sorted_data) + 1]])
    predicted = float(model.predict(next_t)[0])

    # Never predict negative
    return max(0.0, round(predicted, 2))
