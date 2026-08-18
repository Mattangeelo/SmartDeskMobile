# SmartDesk Mobile

Expo / React Native port of the SmartDesk web app (ticket-management system),
built to run in **Expo Go**. Same dark + teal visual language, same screens
(login, cadastro, tickets do usuário, painel admin, perfil) and the same
backend API contracts as the web version.

## Stack

- Expo SDK 57 (React Native 0.86.2, React 19.2) — matches the web project's
  React/RN majors as closely as Expo's bundled versions allow.
- React Navigation v7 (native-stack + bottom-tabs)
- AsyncStorage for the JWT/session (mobile equivalent of `localStorage`)
- `@expo/vector-icons` (Ionicons) instead of inline SVGs

## Getting started

```bash
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_URL
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

### Pointing at your backend

Edit `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api
```

Use your computer's **LAN IP**, not `localhost` — on a physical phone,
`localhost` refers to the phone itself, not your dev machine. If you're
running the Android emulator, `http://10.0.2.2:PORT/api` also works.

If you don't set `.env`, it falls back to `extra.apiUrl` in `app.json`
(currently `https://meuapp.local/api`, the same placeholder the web app used).

## Project structure

```
App.tsx                        # entry point
src/
  theme/colors.ts               # design tokens (dark bg, teal/blue/amber/red accents)
  types/index.ts                # shared types (ported 1:1 from the web app)
  services/                     # API client + one file per resource
    api.ts                      #   fetch wrapper, AsyncStorage-based token/session
    authService.ts
    ticketService.ts
    departamentoService.ts
    empresaService.ts
    usuarioService.ts
  utils/validators.ts           # email/CPF/CNPJ/senha validation (ported 1:1)
  contexts/
    UserContext.tsx             # current session (mirrors web UserContext)
    AdminDataContext.tsx        # shared data + CRUD for the 5 admin tabs
  components/                   # Badge, Modal/Confirm, Pagination, Button,
                                 # FormField, TicketCard, TicketDetailSheet
  navigation/
    RootNavigator.tsx           # SignIn/SignUp vs HomeUser vs HomeAdmin(tabs)
    AdminTabs.tsx                # bottom tabs: Dashboard/Tickets/Usuários/Pendentes/Deptos
  screens/
    SignInScreen.tsx
    SignUpScreen.tsx
    HomeUserScreen.tsx
    EditProfileScreen.tsx
    admin/
      DashboardScreen.tsx
      AdminTicketsScreen.tsx
      UsuariosScreen.tsx
      PendentesScreen.tsx
      DepartamentosScreen.tsx
```

## Notes on the port

- **Auth/session**: `localStorage` → `AsyncStorage`, all async. `UserContext`
  now exposes a `loading` flag the navigator uses to show a spinner while the
  stored session is read on launch.
- **Routing**: React Router → React Navigation. Admin's left sidebar (with
  page state) became a bottom tab bar (Dashboard / Tickets / Usuários /
  Pendentes / Departamentos), since a fixed sidebar doesn't fit a phone.
  The user's HomeUser page keeps the same filters/stats but as horizontal
  chip scrollers instead of a sidebar.
- **Ticket detail panel**: the web app's right-side sliding drawer became a
  bottom sheet-style modal (`TicketDetailSheet`).
- **Modals**: `modal-overlay`/`.modal` CSS became React Native's `Modal`
  component (`src/components/Modal.tsx`), used for ticket/user/department
  forms and confirmation dialogs.
- **Icons**: the web app's inline SVGs were mapped to the closest
  `Ionicons` equivalents rather than porting raw SVG paths.
- **Colors**: the web project's `global.css` variables (`--teal: #1abc9c`,
  etc.) and the actual inline colors used in `HomeUser.tsx`/`HomeAdmin.tsx`
  (`#00d2b4`, `#3b9eff`, `#f59e0b`, `#ff4d6a` on a `#1e1e1e`/`#2a2a2a` dark
  background) didn't fully agree — the components had moved on to a newer
  palette than the CSS file. `src/theme/colors.ts` uses the newer,
  actually-rendered palette.

## Known gaps to revisit

- No offline caching/optimistic UI beyond what the web app had.
- Ticket pagination (`Pagination.tsx`) is ported but not wired into every
  list yet — admin lists currently render the full filtered set in a
  `ScrollView`. Add `paginate()` back in if your ticket volume needs it.
- No push notifications / deep linking.
