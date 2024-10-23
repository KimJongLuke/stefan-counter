import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Car, Plane, Home } from 'lucide-react';

const NumberCard = ({ children, previousValue = '0' }) => {
  const hasChanged = previousValue !== children;
  
  return (
    <div className="bg-gray-800 rounded-md p-2 flex items-center justify-center shadow-lg relative overflow-hidden min-w-12 h-20">
      <div className={`text-4xl font-mono font-bold text-white tabular-nums transition-transform duration-300 ${hasChanged ? '-translate-y-1' : ''}`}>
        {children}
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gray-600 opacity-50"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gray-600 opacity-50"></div>
      {hasChanged && (
        <div className="absolute inset-0 bg-red-500 opacity-10 animate-flash"></div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
    <Icon className="text-red-500" size={24} />
    <div>
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-white font-bold">{value}</div>
    </div>
  </div>
);

const AlternativeSpending = ({ cost, item, icon: Icon, formatter = Math.floor }) => (
  <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
    <Icon className="text-red-500" size={20} />
    <div className="text-gray-300">
      ≈ {formatter(cost)} {item}
    </div>
  </div>
);

const formatNumber = (num) => {
  const [whole, decimal] = num.toFixed(2).split('.');
  const groups = [];
  for (let i = whole.length; i > 0; i -= 3) {
    groups.unshift(whole.slice(Math.max(0, i - 3), i));
  }
  return { groups, decimal };
};

const calculateExactCost = (startDate, monthlyRate) => {
  const now = new Date();
  
  // Calculate exact years and months
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Calculate days in current month
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startDay = startDate.getDate();
  const currentDay = now.getDate();
  
  // Adjust for partial months
  if (currentDay < startDay) {
    months--;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const daysInPrevMonth = prevMonthDays - startDay + currentDay + 1;
    months += daysInPrevMonth / prevMonthDays;
  } else {
    const daysInMonth = currentDay - startDay + 1;
    months += daysInMonth / currentMonthDays;
  }
  
  const totalMonths = years * 12 + months;
  
  // Calculate millisecond-precise additional time
  const millisInDay = 24 * 60 * 60 * 1000;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const millisToday = now - todayStart;
  const dailyRate = monthlyRate / currentMonthDays;
  const millisRate = dailyRate / millisInDay;
  
  const baseCost = totalMonths * monthlyRate;
  const todayCost = millisToday * millisRate;
  
  return baseCost + todayCost;
};

const CentProgress = ({ totalCost, onComplete }) => {
  // Calculate exact progress to next cent
  const fraction = totalCost % 0.01;
  const progress = (fraction / 0.01) * 100;
  
  // Call onComplete when we reach 100%
  useEffect(() => {
    if (progress >= 99.99) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-red-500 h-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-gray-500 text-xs mt-1 text-center">
        Progress to next cent: {progress.toFixed(1)}%
      </div>
    </div>
  );
};

const CostCounter = () => {
  const [totalCost, setTotalCost] = useState(0);
  const [previousNumber, setPreviousNumber] = useState(formatNumber(0));
  const startDate = new Date(2017, 7, 1); // August 1, 2017
  const monthlyRate = 270; // 270€ per month

  const updateCost = () => {
    const newTotal = calculateExactCost(startDate, monthlyRate);
    setTotalCost(newTotal);
  };

  // Handle cent completion
  const handleCentComplete = () => {
    setPreviousNumber(formatNumber(totalCost));
    updateCost();
  };

  useEffect(() => {
    // Initial calculation
    updateCost();
    
    // Update every 50ms for smooth animation
    const interval = setInterval(updateCost, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate exact statistics
  const now = new Date();
  const monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 
    + (now.getMonth() - startDate.getMonth());
  const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const normalStudyDuration = 6; // semesters
  const semestersPassed = monthsPassed / 6;

  const monthlyRent = 600;
  const rentMonths = totalCost / monthlyRent;
  
  const { groups, decimal } = formatNumber(totalCost);
  const prevGroups = previousNumber.groups;
  const prevDecimal = previousNumber.decimal;

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-6 text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-2">
            STEFAN'S ETERNAL STUDENT COSTS
          </h1>
          <p className="text-gray-400">The Bachelor Degree That Never Ends</p>
          <p className="text-sm text-gray-500">Draining Money Since: August 2017</p>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Counter */}
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-wrap justify-center items-center gap-2">
              {groups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {groupIndex > 0 && (
                    <div className="text-gray-500 text-4xl">.</div>
                  )}
                  <div className="flex gap-1">
                    {group.split('').map((digit, digitIndex) => (
                      <NumberCard 
                        key={digitIndex}
                        previousValue={prevGroups[groupIndex]?.charAt(digitIndex) || '0'}
                      >
                        {digit}
                      </NumberCard>
                    ))}
                  </div>
                </React.Fragment>
              ))}
              <div className="text-red-500 text-4xl mx-2">,</div>
              <div className="flex gap-1">
                {decimal.split('').map((digit, idx) => (
                  <NumberCard 
                    key={idx}
                    previousValue={prevDecimal?.charAt(idx) || '0'}
                  >
                    {digit}
                  </NumberCard>
                ))}
              </div>
              <div className="text-red-500 text-4xl ml-2">€</div>
            </div>
            
            {/* Progress Bar */}
            <CentProgress 
              totalCost={totalCost} 
              onComplete={handleCentComplete}
            />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              icon={Clock} 
              title="Time as Student" 
              value={`${monthsPassed} months (${daysPassed} days)`}
            />
            <StatCard 
              icon={Clock} 
              title="Semesters Passed" 
              value={`${semestersPassed.toFixed(1)} of ${normalStudyDuration} planned`}
            />
            <StatCard 
              icon={Clock} 
              title="Study Duration Exceeded By" 
              value={`${(semestersPassed - normalStudyDuration).toFixed(1)} semesters`}
            />
          </div>

          {/* Alternative Spending Section */}
          <div className="mt-8">
            <h3 className="text-red-500 text-xl mb-4 text-center">Instead, Stefan could have paid:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AlternativeSpending 
                cost={rentMonths}
                item="months of rent for his apartment (600€/month)"
                icon={Home}
                formatter={(num) => num.toFixed(1)}
              />
              <AlternativeSpending 
                cost={totalCost / 3.5} 
                item="cappuccinos"
                icon={Coffee}
              />
              <AlternativeSpending 
                cost={totalCost / 1000} 
                item="round-trip flights to Bali"
                icon={Plane}
              />
              <AlternativeSpending 
                cost={totalCost / 10000} 
                item="used cars"
                icon={Car}
              />
            </div>
          </div>
          
          <div className="text-center text-red-500 font-mono text-xl mt-8">
            <div>Monthly Burden: 270,00 €</div>
            <div className="text-sm text-gray-500">
              That's {(270 / 30 / 24 / 60 / 60).toFixed(6)}€ every second
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCounter;