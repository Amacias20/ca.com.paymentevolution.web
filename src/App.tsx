import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@progress/kendo-theme-default/dist/all.css';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRouter />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 99999 }}
        />
      </ThemeProvider>
    </Provider>
  );
};

export default App;