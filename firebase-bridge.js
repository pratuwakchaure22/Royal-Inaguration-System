/* Socket.IO-compatible bridge backed by Firebase Realtime Database.
   This lets the existing display.html and controller.html keep using io(),
   socket.on(...) and socket.emit(...) with minimal changes. */
(function () {
  const firebaseConfig = {
  const placeholder = Object.values(cfg).some(v => String(v).includes('PASTE_YOUR_'));

  if (placeholder) {
    console.error('Firebase is not configured. Edit firebase-config.js first.');
  }

  if (!firebase.apps.length) firebase.initializeApp(cfg);
  const db = firebase.database();
  const clientId = 'client_' + Math.random().toString(36).slice(2) + Date.now();
  const commandRef = db.ref('smartCurtain/command');
  const stateRef = db.ref('smartCurtain/state');

  function io() {
    const handlers = {};
    let lastCommandId = null;
    let initialized = false;

    const socket = {
      id: clientId,
      on(event, callback) {
        (handlers[event] ||= []).push(callback);

        if (event === 'curtain-state') {
          stateRef.child('curtainState').on('value', snap => {
            if (snap.exists()) callback(snap.val());
          });
        }
        if (event === 'show-image') {
          stateRef.child('currentImageIndex').on('value', snap => {
            if (snap.exists()) callback(Number(snap.val()));
          });
        }
        return socket;
      },
      emit(event, payload) {
        const updates = {};
        if (event === 'open-curtain') updates['curtainState'] = 'open';
        if (event === 'close-curtain') updates['curtainState'] = 'closed';
        if (event === 'show-image') updates['currentImageIndex'] = Number(payload);
        if (Object.keys(updates).length) stateRef.update(updates);

        if (event === 'next-image' || event === 'prev-image') {
          stateRef.child('currentImageIndex').transaction(current => {
            current = Number(current || 0);
            return event === 'next-image' ? current + 1 : current - 1;
          });
        }

        return commandRef.set({
          id: clientId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2),
          event,
          payload: payload === undefined ? null : payload,
          sender: clientId,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      }
    };

    function fire(event, payload) {
      (handlers[event] || []).forEach(fn => fn(payload));
    }

    firebase.database().ref('.info/connected').on('value', snap => {
      fire(snap.val() ? 'connect' : 'disconnect');
    });

    commandRef.on('value', snap => {
      const cmd = snap.val();
      if (!cmd || !cmd.id) return;
      if (!initialized) { initialized = true; lastCommandId = cmd.id; return; }
      if (cmd.id === lastCommandId || cmd.sender === clientId) return;
      lastCommandId = cmd.id;
      fire(cmd.event, cmd.payload);
    });

    return socket;
  }

  window.io = io;
})();
