export const getPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 1000) / 10;
};

export const getProgressColor = (percentage) => {
    if (percentage >= 60) return "#2fbf71";
    if (percentage >= 40) return "#f4b63f";
    return "#e7475e";
};

export const getAuthTotalCost = (auth) => auth?.Services?.reduce((acc, curr) => acc + Number(curr.monthlyCost), 0) || 0;
