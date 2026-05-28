from channels.generic.websocket import AsyncJsonWebsocketConsumer


class ListCollaborationConsumer(AsyncJsonWebsocketConsumer):
    active_users = {}

    async def connect(self):
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            await self.close()
            return

        self.list_id = self.scope['url_route']['kwargs']['list_id']
        self.group_name = f"list_{self.list_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self._add_presence(user)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self._remove_presence(self.scope.get('user'))

    async def receive_json(self, content, **kwargs):
        if content.get('type') == 'ping':
            await self.send_json({'type': 'pong'})

    async def list_event(self, event):
        await self.send_json(
            {
                'type': event.get('event'),
                'payload': event.get('payload'),
            }
        )

    async def presence_update(self, event):
        await self.send_json(
            {
                'type': 'presence',
                'payload': event.get('payload', {}),
            }
        )

    async def _add_presence(self, user):
        if not user or user.is_anonymous:
            return

        active_for_list = self.active_users.setdefault(self.list_id, {})
        active_for_list[user.id] = {
            'id': user.id,
            'username': user.username,
            'display_name': user.first_name or user.username,
        }
        await self._broadcast_presence()

    async def _remove_presence(self, user):
        if not user or user.is_anonymous:
            return

        active_for_list = self.active_users.get(self.list_id, {})
        active_for_list.pop(user.id, None)

        if not active_for_list:
            self.active_users.pop(self.list_id, None)

        await self._broadcast_presence()

    async def _broadcast_presence(self):
        active_for_list = self.active_users.get(self.list_id, {})
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'presence.update',
                'payload': {
                    'list_id': self.list_id,
                    'users': list(active_for_list.values()),
                },
            },
        )
