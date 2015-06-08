package com.example.asas;

import java.net.URISyntaxException;

import org.json.JSONException;
import org.json.JSONObject;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.ActionBar;
import android.support.v4.app.Fragment;
import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.os.Build;



@SuppressWarnings("deprecation")
public class MainActivity extends ActionBarActivity {

	private Socket mSocket;
	{
	    try {
	        mSocket = IO.socket("http://192.168.0.103:3003");
	    } catch (URISyntaxException e) {
	        throw new RuntimeException(e);
	    }
	}
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.container, new PlaceholderFragment())
                    .commit();
        }
        mSocket.on(Socket.EVENT_CONNECT, onConnect);

//	    mSocket.on("updateLatLong", onUpdateLatLong);
	    mSocket.connect();
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();

        mSocket.disconnect();
		mSocket.off(Socket.EVENT_CONNECT, onConnect);
//		mSocket.off("updateLatLong", onUpdateLatLong);
    }

    private Emitter.Listener onConnect = new Emitter.Listener() {
	    @Override
	    public void call(final Object... args) {
	    	String myString = null;
	    	try {
				myString = new JSONObject().put("user", "78").toString();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	            	mSocket.emit("addMeCustomer", myString);
	            	String tittle="tittle";
	                String subject="subject";
	                String body="body";
	                
	                NotificationManager notif=(NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
	                Notification notify=new Notification(android.R.drawable.stat_notify_more,tittle,System.currentTimeMillis());
	                PendingIntent pending= PendingIntent.getActivity(getApplicationContext(), 0, new Intent(), 0);
	                
	                notify.setLatestEventInfo(getApplicationContext(),subject,body,pending);
	                notif.notify(0, notify);
	    }
	};

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

    /**
     * A placeholder fragment containing a simple view.
     */
    public static class PlaceholderFragment extends Fragment {
		
    	public PlaceholderFragment() {
        }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.fragment_main, container, false);
            return rootView;
        }
    }
}