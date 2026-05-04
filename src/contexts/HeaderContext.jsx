import { createContext, useContext, useState } from "react";

const HeaderContext = createContext({
  customLeftComponent: null,
  setCustomLeftComponent: () => {},
});

export function HeaderProvider({ children }) {
  const [customLeftComponent, setCustomLeftComponent] = useState(null);
  return (
    <HeaderContext.Provider value={{ customLeftComponent, setCustomLeftComponent }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  return useContext(HeaderContext);
}
