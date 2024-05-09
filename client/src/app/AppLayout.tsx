"use client";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
// ...
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

// drawer Icons
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import RollerSkatingOutlinedIcon from "@mui/icons-material/RollerSkatingOutlined";
import ToysOutlinedIcon from "@mui/icons-material/ToysOutlined";

import Image from "next/image";
import {
  Avatar,
  Button,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  IconButton,
  Badge,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";

import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import GamesIcon from "@mui/icons-material/Games";
import ClearIcon from "@mui/icons-material/Clear";
import HomeIcon from "@mui/icons-material/Home";

// @ts-ignore
import chatBotLogo from "@/assets/chatBot.png";
import { useRouter } from "next/navigation";

import SearchPage from "@/components/SearchPage";
import UserContext from "./DataContext";

const drawerWidth = 240;
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

const drawerMenu = [
  {
    label: "Home",
    icon: HomeIcon,
    path: "/app",
  },
  {
    label: "Electronics",
    icon: DevicesOtherIcon,
    path: "/app/electronics",
  },
  {
    label: "Mobiles",
    icon: PhoneAndroidIcon,
    path: "/app/mobiles",
  },
  {
    label: "Clothes",
    icon: CheckroomIcon,
    path: "/app/clothes",
  },
  // {
  //   label: "Footwears",
  //   icon: RollerSkatingOutlinedIcon,
  // },
  {
    label: "Games",
    icon: GamesIcon,
    path: "/app/games",
  },
  {
    label: "Toys",
    icon: ToysOutlinedIcon,
    path: "/app/toys",
  },
];

const drawerSubMenu = [
  {
    label: "Favorites",
    icon: BookmarksOutlinedIcon,
    path: "/app/favorites",
  },
  {
    label: "Orders",
    icon: ShoppingCartCheckoutOutlinedIcon,
    path: "/app/cart",
  },
];

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  position: "relative",
  backgroundColor: "white",
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    // width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

export default function AppLayout(props: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // account menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClickAM = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAM = () => {
    setAnchorEl(null);
  };
  // ---

  // search
  const [searchInput, setSearchInput] = React.useState("");
  const [searchData, setSearchData] = React.useState<ProductType[]>();
  const [searching, setSearching] = React.useState(false);

  // let loggedUser: string | null = null;

  let user: any;

  const [loggedUser, setLoggedUser] = React.useState<User>();
  const { setUser, cart } = React.useContext(UserContext)!;
  const [initiating, setInitiation] = React.useState(true);

  React.useEffect(() => {
    user = sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user") ?? "")
      : null;
    setLoggedUser(user);
    setUser(user);
    setInitiation(false);
    // console.log(user)
  }, []);

  // console.log({ loggedUser });
  // console.log({ searchInput });

  const searchProduct = async () => {
    setSearching(true);
    const res = await fetch(`${baseURL}api/search`, {
      body: JSON.stringify({
        userId: loggedUser?.id ?? "undefined",
        searchKeyword: searchInput,
      }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    const resData = await res.json();
    setSearchData(resData);
    setSearching(false);
  };

  if (initiating) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar
          sx={{
            background:
              "linear-gradient(90deg, rgba(153,154,155,1) 0%, rgba(65,90,119,1) 20%)",
          }}
          position="fixed"
          open={open}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton> */}
            <Stack
              sx={{ cursor: "pointer" }}
              direction="row"
              onClick={() => router.push("/app")}
              alignItems="center"
              gap={1}
            >
              <Image
                src="/logo4.png"
                width={56}
                height={56}
                alt="Logo"
                style={{ filter: "drop-shadow(0 0 0.125rem blue)" }}
              />
              <Typography variant="h5">MZone</Typography>
            </Stack>
            <Box sx={{ width: "40%", display: "flex" }}>
              <InputBase
                sx={{ ml: 1, flex: 1, color: "white" }}
                placeholder="Search your favorite Products ..."
                inputProps={{ "aria-label": "search products" }}
                value={searchInput}
                onChange={(v) => {
                  if (!v.target.value) setSearchData(undefined);
                  setSearchInput(v.target.value);
                }}
                endAdornment={
                  <IconButton
                    sx={{
                      color: "white",
                      opacity: "0.75",
                      "&:hover": { opacity: 1 },
                    }}
                    onClick={() => {
                      setSearchData(undefined);
                      setSearchInput("");
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              />
              <IconButton
                type="button"
                sx={{ p: "10px", color: "white" }}
                aria-label="search-voice"
              >
                <KeyboardVoiceIcon />
              </IconButton>
              <IconButton
                type="button"
                sx={{ p: "10px", color: "white" }}
                aria-label="search"
                onClick={searchProduct}
              >
                <SearchIcon />
              </IconButton>
            </Box>

            <Tooltip title="Account">
              <IconButton
                color="inherit"
                aria-label="Account"
                onClick={handleClickAM}
                edge="start"
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              top: 64,
              backgroundColor: "#f0f0f0",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <Typography variant="h6" align="center">
              Explore
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {drawerMenu.map((e) => (
              <ListItem key={e.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    setSearchData(undefined);
                    setSearchInput("");
                    router.push(e.path);
                  }}
                >
                  <ListItemIcon>
                    <e.icon />
                  </ListItemIcon>
                  <ListItemText primary={e.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          {loggedUser ? (
            <List>
              {drawerSubMenu.map((e) => (
                <ListItem key={e.label} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setSearchData(undefined);
                      setSearchInput("");
                      router.push(e.path);
                    }}
                  >
                    <ListItemIcon>{<e.icon />}</ListItemIcon>
                    <ListItemText primary={e.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={2}>
              <Typography>
                Log In to add/view your Favorites and Orders
              </Typography>
              <Button
                onClick={() => router.push("/sign-in")}
                sx={{ mt: 2 }}
                variant="outlined"
                startIcon={<LoginIcon />}
              >
                Log In
              </Button>
            </Box>
          )}

          <Divider />

          <Box
            p={2}
            display="flex"
            mt={1}
            justifyContent="center"
            alignItems="center"
          >
            <Typography>Let's Talk with our AI Representative</Typography>
            <Image
              style={{ cursor: "pointer" }}
              src={chatBotLogo}
              width={64}
              alt="Chat Bot"
            />
          </Box>
        </Drawer>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            mr: 2,
            ...(open && { display: "none" }),
            position: "fixed",
            top: 72,
            left: 24,
            zIndex: 1200,
          }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            mr: 2,
            ...(open && { display: "none" }),
            position: "fixed",
            top: 72,
            left: 24,
            zIndex: 1200,
          }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => router.push("/app/cart")}
          edge="start"
          sx={{
            mr: 2,
            position: "fixed",
            top: 72,
            right: 24,
            zIndex: 1200,
          }}
        >
          <Badge badgeContent={cart.length} color="secondary">
            <ShoppingCartOutlinedIcon sx={{ fontSize: 32 }} />
          </Badge>
        </IconButton>

        <Main open={open}>
          <DrawerHeader />

          <Box mt={3} id="main-content">
            {searchData ? (
              <SearchPage
                setSearchData={setSearchData}
                setSearchInput={setSearchInput}
                searchInput={searchInput}
                searching={searching}
                searchData={searchData}
              />
            ) : (
              props.children
            )}
          </Box>
        </Main>
      </Box>
      {/* ACcount Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openMenu}
        onClose={handleCloseAM}
        onClick={handleCloseAM}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {loggedUser ? (
          <Box>
            <MenuItem onClick={handleCloseAM}>
              <Avatar sx={{ bgcolor: "#119ad0" }}>
                {/* @ts-ignore */}
                {loggedUser.username?.slice(0, 1).toUpperCase()}
              </Avatar>{" "}
              {loggedUser.username}
            </MenuItem>
            <MenuItem onClick={handleCloseAM}>
              <Avatar /> My account
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseAM}>
              <ListItemIcon>
                <PersonAdd fontSize="small" />
              </ListItemIcon>
              Add another account
            </MenuItem>
            <MenuItem onClick={handleCloseAM}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                router.push("/sign-in");
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Box>
        ) : (
          <MenuItem onClick={() => router.push("/sign-in")}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            Log In
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
