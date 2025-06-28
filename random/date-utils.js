// Utility functions for date calculations

// Get the start and end date of a week (Thursday to Wednesday)
function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, etc.
    
    // Calculate days to subtract to get to Thursday
    // Thursday = 4, so we want: Thu(0), Fri(1), Sat(2), Sun(3), Mon(4), Tue(5), Wed(6)
    let daysToThursday;
    if (day >= 4) {
        // Thursday to Saturday: subtract (day - 4) days
        daysToThursday = day - 4;
    } else {
        // Sunday to Wednesday: subtract (day + 3) days to get to previous Thursday
        daysToThursday = day + 3;
    }
    
    const thursday = new Date(d);
    thursday.setDate(d.getDate() - daysToThursday);
    
    const wednesday = new Date(thursday);
    wednesday.setDate(thursday.getDate() + 6);
    
    return {
        start: formatDate(thursday),
        end: formatDate(wednesday),
        display: `${formatDisplayDate(thursday)} - ${formatDisplayDate(wednesday)}`
    };
}

// Get all weeks in a month
function getWeeksInMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks = [];
    
    let current = new Date(firstDay);
    while (current <= lastDay) {
        const weekRange = getWeekRange(current);
        // Only include weeks that have at least one day in the current month
        if (new Date(weekRange.start) <= lastDay && new Date(weekRange.end) >= firstDay) {
            weeks.push(weekRange);
        }
        current.setDate(current.getDate() + 7);
    }
    
    return weeks;
}

// Get recent weeks (last 8 weeks)
function getRecentWeeks() {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        weeks.push(getWeekRange(date));
    }
    
    return weeks;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display (MMM DD)
function formatDisplayDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Get month range
function getMonthRange(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    
    return {
        start: formatDate(start),
        end: formatDate(end),
        display: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
}

// Get recent months (last 6 months)
function getRecentMonths() {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(getMonthRange(date.getFullYear(), date.getMonth()));
    }
    
    return months;
}

module.exports = {
    getWeekRange,
    getWeeksInMonth,
    getRecentWeeks,
    getMonthRange,
    getRecentMonths,
    formatDate,
    formatDisplayDate
};