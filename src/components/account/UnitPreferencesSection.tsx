import React from 'react';

interface UnitPreferencesSectionProps {
  preferences: {
    weightUnit: string;
    distanceUnit: string;
  };
  unitPrefsLoading: boolean;
  unitPrefsUpdating: boolean;
  onUnitPreferenceChange: (key: 'weightUnit' | 'distanceUnit', value: any) => void;
}

const UnitPreferencesSection: React.FC<UnitPreferencesSectionProps> = ({
  preferences,
  unitPrefsLoading,
  unitPrefsUpdating,
  onUnitPreferenceChange
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-theme-fg mb-4">Unit Preferences</h2>
      <div className="bg-theme-card shadow sm:rounded-lg border border-theme-border">
        <div className="px-4 py-5 sm:p-6">
          {unitPrefsLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-4 bg-theme-accent rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-theme-accent rounded col-span-2"></div>
                    <div className="h-4 bg-theme-accent rounded col-span-1"></div>
                  </div>
                  <div className="h-4 bg-theme-accent rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-theme-fg">Weight Units</h3>
                <p className="mt-1 text-sm text-theme-fg opacity-70">
                  Choose your preferred unit for displaying weight measurements.
                </p>
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        value="lb"
                        checked={preferences.weightUnit === 'lb'}
                        onChange={() => onUnitPreferenceChange('weightUnit', 'lb')}
                        disabled={unitPrefsUpdating}
                      />
                      <span className="ml-2">Pounds (lb)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        value="kg"
                        checked={preferences.weightUnit === 'kg'}
                        onChange={() => onUnitPreferenceChange('weightUnit', 'kg')}
                        disabled={unitPrefsUpdating}
                      />
                      <span className="ml-2">Kilograms (kg)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-theme-fg">Distance Units</h3>
                <p className="mt-1 text-sm text-theme-fg opacity-70">
                  Choose your preferred unit for displaying distance measurements.
                </p>
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        value="mi"
                        checked={preferences.distanceUnit === 'mi'}
                        onChange={() => onUnitPreferenceChange('distanceUnit', 'mi')}
                        disabled={unitPrefsUpdating}
                      />
                      <span className="ml-2">Miles (mi)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        value="km"
                        checked={preferences.distanceUnit === 'km'}
                        onChange={() => onUnitPreferenceChange('distanceUnit', 'km')}
                        disabled={unitPrefsUpdating}
                      />
                      <span className="ml-2">Kilometers (km)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        value="m"
                        checked={preferences.distanceUnit === 'm'}
                        onChange={() => onUnitPreferenceChange('distanceUnit', 'm')}
                        disabled={unitPrefsUpdating}
                      />
                      <span className="ml-2">Meters (m)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {unitPrefsUpdating && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitPreferencesSection; 