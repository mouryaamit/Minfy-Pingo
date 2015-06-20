package com.example.customer_sample;

import java.net.URISyntaxException;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

@SuppressWarnings("deprecation")
public class MainActivity extends ActionBarActivity {
	private static Socket mSocket;
	{
		try {
			mSocket = IO.socket(Constants.CHAT_SERVER_URL);
		} catch (URISyntaxException e) {
			throw new RuntimeException(e);
		}
	}

	private static Integer pid = 45;
	private static Integer cid = 78;
	private static Integer cobId = 1276623;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		if (savedInstanceState == null) {
			getSupportFragmentManager().beginTransaction()
					.add(R.id.container, new PlaceholderFragment()).commit();
		}

		mSocket.on(Socket.EVENT_CONNECT, onConnect);
		mSocket.on(Socket.EVENT_RECONNECT, onConnect);
		mSocket.on(Socket.EVENT_CONNECT_ERROR, onConnectError);
		mSocket.on(Socket.EVENT_CONNECT_TIMEOUT, onConnectError);
		mSocket.on("Reconnect", onReconnect);
		mSocket.on("totalPingoOnline", onTotalPingoOnline);
		mSocket.on("PickupLatLongDetails", onPickupLatLongDetails);
		mSocket.on("bookingFail", onBookingFail);
		mSocket.on("bookingSuccess", onBookingSuccess);
		mSocket.on("cancelFail", onCancelFail);
		mSocket.on("cancelSuccess", onCancelSuccess);
		mSocket.on("pickupConfirm", onPickupConfirm);

		mSocket.connect();
	}

	@Override
	public void onDestroy() {
		super.onDestroy();

		mSocket.disconnect();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle action bar item clicks here. The action bar will
		// automatically handle clicks on the Home/Up button, so long
		// as you specify a parent activity in AndroidManifest.xml.
		int id = item.getItemId();
		if (id == R.id.action_settings) {
			return true;
		}
		return super.onOptionsItemSelected(item);
	}

	public static class PlaceholderFragment extends Fragment {

		public PlaceholderFragment() {
		}

		@Override
		public View onCreateView(LayoutInflater inflater, ViewGroup container,
				Bundle savedInstanceState) {
			View rootView = inflater.inflate(R.layout.fragment_main, container,
					false);
			return rootView;
		}

		public void onViewCreated(View view, Bundle savedInstanceState) {
			super.onViewCreated(view, savedInstanceState);
			Button action_booknow = (Button) view
					.findViewById(R.id.action_booknow);

			action_booknow.setOnClickListener(new View.OnClickListener() {
				@Override
				public void onClick(View v) {
					String myString = null;
					JSONObject obj = new JSONObject();
					try {
						myString = obj.put("cid", cid).toString();
						myString = obj.put("pid", pid).toString();
						myString = obj.put("cobId", cobId).toString();
					} catch (JSONException e) {
						e.printStackTrace();
					}
					System.out.println(myString);
					mSocket.emit("bookNow", myString);
				}
			});

			Button action_cancelbooking = (Button) view
					.findViewById(R.id.action_cancelbooking);

			action_cancelbooking.setOnClickListener(new View.OnClickListener() {

				@Override
				public void onClick(View v) {
					String myString = null;
					JSONObject obj = new JSONObject();
					try {
						myString = obj.put("cid", cid).toString();
						myString = obj.put("pid", pid).toString();
						myString = obj.put("cobId", cobId).toString();
					} catch (JSONException e) {
						e.printStackTrace();
					}
					System.out.println(myString);
					mSocket.emit("cancelBooking", myString);
				}

			});

		}
	}

	private Emitter.Listener onConnect = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {
			String myString = null;
			try {
				myString = new JSONObject().put("user", cid).toString();
			} catch (Exception e) {
				System.out.println("�rror : " + e.getMessage());
				e.printStackTrace();
			}
			mSocket.emit("addMeCustomer", myString);
		}
	};

	private Emitter.Listener onConnectError = new Emitter.Listener() {
		@Override
		public void call(Object... args) {
			MainActivity.this.runOnUiThread(new Runnable() {
				@Override
				public void run() {

				}
			});
		}
	};

	private Emitter.Listener onReconnect = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {
			String myString = null;
			try {
				myString = new JSONObject().put("user", cid).toString();
			} catch (Exception e) {
				System.out.println("�rror : " + e.getMessage());
				e.printStackTrace();
			}
			mSocket.emit("addMeCustomer", myString);
		}
	};

	private Emitter.Listener onTotalPingoOnline = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {
			MainActivity.this.runOnUiThread(new Runnable() {
				@Override
				public void run() {
					System.out.println("Pingo Online : " + args[0]);
				}
			});
		}
	};

	private Emitter.Listener onPickupLatLongDetails = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {
			JSONObject data = (JSONObject) args[0];
			try {
				System.out.println("Pingo = " + data.getString("pid"));
				System.out.println("Lat = " + data.getString("lat"));
				System.out.println("Long = " + data.getString("long"));
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	};

	private Emitter.Listener onBookingFail = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {

			NotificationManager notif = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			Notification notify = new Notification(
					android.R.drawable.stat_notify_more, "Booking Fail",
					System.currentTimeMillis());
			PendingIntent pending = PendingIntent.getActivity(
					getApplicationContext(), 0, new Intent(), 0);

			notify.setLatestEventInfo(getApplicationContext(), "Booking Fail",
					"Booking Fail", pending);
			notif.notify(0, notify);

		}
	};

	private Emitter.Listener onBookingSuccess = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {

			NotificationManager notif = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			Notification notify = new Notification(
					android.R.drawable.stat_notify_more, "Booking Success",
					System.currentTimeMillis());
			PendingIntent pending = PendingIntent.getActivity(
					getApplicationContext(), 0, new Intent(), 0);

			notify.setLatestEventInfo(getApplicationContext(),
					"Booking Success", "Booking Success", pending);
			notif.notify(0, notify);
		}
	};

	private Emitter.Listener onCancelFail = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {

			NotificationManager notif = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			Notification notify = new Notification(
					android.R.drawable.stat_notify_more, "Cancel Fail",
					System.currentTimeMillis());
			PendingIntent pending = PendingIntent.getActivity(
					getApplicationContext(), 0, new Intent(), 0);

			notify.setLatestEventInfo(getApplicationContext(), "Cancel Fail",
					"Cancel Fail", pending);
			notif.notify(0, notify);

		}
	};

	private Emitter.Listener onCancelSuccess = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {

			NotificationManager notif = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			Notification notify = new Notification(
					android.R.drawable.stat_notify_more, "Cancel Success",
					System.currentTimeMillis());
			PendingIntent pending = PendingIntent.getActivity(
					getApplicationContext(), 0, new Intent(), 0);

			notify.setLatestEventInfo(getApplicationContext(),
					"Cancel Success", "Cancel Success", pending);
			notif.notify(0, notify);

		}
	};

	private Emitter.Listener onPickupConfirm = new Emitter.Listener() {
		@Override
		public void call(final Object... args) {

			NotificationManager notif = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			Notification notify = new Notification(
					android.R.drawable.stat_notify_more, "Pickup Confirm",
					System.currentTimeMillis());
			PendingIntent pending = PendingIntent.getActivity(
					getApplicationContext(), 0, new Intent(), 0);

			notify.setLatestEventInfo(getApplicationContext(),
					"Pickup Confirm", "Pickup Confirm", pending);
			notif.notify(0, notify);
		}
	};

}