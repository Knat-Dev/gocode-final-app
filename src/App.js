import React from 'react';
import {
    Grid,
    makeStyles,
    createMuiTheme,
    ThemeProvider,
} from '@material-ui/core';
import AppRouter from './components/router/AppRouter';

const useStyles = makeStyles((theme) => ({
    fullPage: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#333',
    },
}));

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#4964b3',
            contrastText: '#fff',
        },
        paperOutline: '1px #565656 solid',
    },
});

function App() {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <Grid container direction="column" className={classes.fullPage}>
                <AppRouter />
            </Grid>
        </ThemeProvider>
    );
}

export default App;
