using System;
using System.Text;
using System.Configuration.Install;
using System.Collections;
using System.Diagnostics;
using System.ServiceProcess;
using System.Reflection;
using Microsoft.Win32;
using System.Runtime.InteropServices;  

namespace sample
{
    public enum ServiceState  
    {  
        SERVICE_STOPPED = 0x00000001,  
        SERVICE_START_PENDING = 0x00000002,  
        SERVICE_STOP_PENDING = 0x00000003,  
        SERVICE_RUNNING = 0x00000004,  
        SERVICE_CONTINUE_PENDING = 0x00000005,  
        SERVICE_PAUSE_PENDING = 0x00000006,  
        SERVICE_PAUSED = 0x00000007,  
    }  

   
    [System.ComponentModel.RunInstallerAttribute(true)]
	public class SampleInstallerClass : Installer
	{
		static public String SVC_APP_NAME    = "snaplen";
        static public String SVC_SERVICE_PKEY = @"SYSTEM\CurrentControlSet\Services";
		static public String SVC_SERVICE_KEY = @"SYSTEM\CurrentControlSet\Services\" + SVC_APP_NAME;

		public SampleInstallerClass()
		{
			ServiceProcessInstaller spi = new ServiceProcessInstaller();
			ServiceInstaller si = new ServiceInstaller();

			spi.Account    = ServiceAccount.LocalSystem;
            spi.Username   = null;
            spi.Password   = null;


			si.StartType   = ServiceStartMode.Manual;

			si.ServiceName = SVC_APP_NAME;
            si.DisplayName = SVC_APP_NAME;

			Installers.Add(spi);
			Installers.Add(si);
		}

		static int install_uninstall( bool uninstall )
		{
			try
			{
				TransactedInstaller ti = new TransactedInstaller();

				if ( uninstall == false )
				{
					ArrayList cmdline = new ArrayList();
                    Console.WriteLine(Assembly.GetExecutingAssembly().Location);
					cmdline.Add( "/LogToConsole=false" );
					cmdline.Add( "/ShowCallStack" );
                    cmdline.Add( Assembly.GetExecutingAssembly().Location );
                    string[] str = cmdline.ToArray(typeof(string)) as string[];
                    foreach(string s in str) {
                        Console.WriteLine(s);
                    }
					InstallContext ctx = new InstallContext("install.log", cmdline.ToArray(typeof(string)) as string[] );

					ti.Installers.Add( new SampleInstallerClass() );
					ti.Context = ctx;
					ti.Install( new Hashtable() );

					RegistryKey k = Registry.LocalMachine.OpenSubKey( SVC_SERVICE_KEY, true );
					k.SetValue("Description", "Sample service");
					k.CreateSubKey("Parameters"); // add any configuration parameters in to this sub-key to read back OnStart()
					k.Close();

					Console.WriteLine("Installation successful, starting service '{0}'...", SVC_APP_NAME );

					// attempt to start the service
                    /*
					ServiceController service = new ServiceController( SVC_APP_NAME );
					TimeSpan timeout = TimeSpan.FromMilliseconds(15000);
					service.Start();
					service.WaitForStatus( ServiceControllerStatus.Running, timeout );
                    */

					return 0;
				}
				else
				{
                    

                    ServiceController service = new ServiceController( SVC_APP_NAME );
                    TimeSpan timeout = TimeSpan.FromMilliseconds(15000);
                    service.Stop();
                    service.WaitForStatus( ServiceControllerStatus.Stopped, timeout );

                    ArrayList cmdline = new ArrayList();
                    cmdline.Add( "/u" );
                    cmdline.Add( Assembly.GetExecutingAssembly().Location );
                    InstallContext ctx = new InstallContext("install.log", cmdline.ToArray(typeof(string)) as string[] );
                    ti.Installers.Add( new SampleInstallerClass() );
					ti.Context = ctx;
					ti.Uninstall(null);


                    RegistryKey key = Registry.CurrentUser.OpenSubKey(SVC_SERVICE_PKEY, true);
                    key.DeleteSubKeyTree(SVC_APP_NAME);
                    key.Close();

					return 0;
				}
			}
			catch (Exception e)
			{
				Console.WriteLine(e.InnerException.Message + e.StackTrace);
				return(1);
			}
		}
        
		static int Main(string[] args)
		{
            System.ServiceProcess.ServiceBase.Run(new SimpleService());
            return install_uninstall(false);

			if ( args.Length > 0 )
			{
				String cmd = args[0];
				if ( cmd.Equals("-i") || cmd.Equals("-u") )
				{
					return install_uninstall( cmd.Equals("-u") );
				}
				else if ( cmd.Equals("-h") )
				{
					Console.Write( SVC_APP_NAME );
					Console.Write("Options:\n");
					Console.Write("  --help\tShow command line switch help\n");
					Console.Write("  -i\t\tInstall Service\n\t\t-u\tUninstall Service\n");
				}
				return (0);
			}
			else
			{
				Console.Write( SVC_APP_NAME +"\n");
                Console.Write("Options:\n");
                Console.Write("  -h Show command line switch help\n");
                Console.Write("  -i Install Service\n");
                Console.Write("  -u Uninstall Service\n");
			}
			ServiceBase.Run( new SimpleService() );
			return 0;
		}
        
	}

	// Define a simple service implementation.
    
    public enum SimpleServiceCustomCommands { StopWorker = 128, RestartWorker, CheckWorker };    
    [StructLayout(LayoutKind.Sequential)]
    public struct SERVICE_STATUS
    {
        public int serviceType;
        public int currentState;
        public int controlsAccepted;
        public int win32ExitCode;
        public int serviceSpecificExitCode;
        public int checkPoint;
        public int waitHint;
    }
    public class SimpleService : System.ServiceProcess.ServiceBase
    {
        private static int userCount = 0;
        private static System.Threading.ManualResetEvent pause = new System.Threading.ManualResetEvent(false);
        [DllImport("ADVAPI32.DLL", EntryPoint = "SetServiceStatus")]
        public static extern bool SetServiceStatus(IntPtr hServiceStatus,SERVICE_STATUS lpServiceStatus);
        private SERVICE_STATUS myServiceStatus;
        private System.Threading.Thread workerThread = null;
        public SimpleService()
        {
            CanPauseAndContinue = true;
            CanHandleSessionChangeEvent = true;
            ServiceName = "SimpleService";
        }

        static void Main2()
        {
            /*
            EventLog.WriteEntry("SimpleService.Main", DateTime.Now.ToLongTimeString() +
                " - Service main method starting...");
            */

            // Load the service into memory.
            System.ServiceProcess.ServiceBase.Run(new SimpleService());

            /*
            EventLog.WriteEntry("SimpleService.Main", DateTime.Now.ToLongTimeString() +
                " - Service main method exiting...");
            */

        }

        private void InitializeComponent()
        {
            // Initialize the operating properties for the service.
            this.CanPauseAndContinue = true;
            this.CanShutdown = true;
            this.CanHandleSessionChangeEvent = true;
            this.ServiceName = "SimpleService";
        }

        // Start the service.
        protected override void OnStart(string[] args)
        {
            IntPtr handle = this.ServiceHandle;
            myServiceStatus.currentState = (int)ServiceState.SERVICE_START_PENDING;
            SetServiceStatus(handle, myServiceStatus);

            // Start a separate thread that does the actual work.

            if ((workerThread == null) || ((workerThread.ThreadState & (System.Threading.ThreadState.Unstarted | System.Threading.ThreadState.Stopped)) != 0))
            {
                /*
                EventLog.WriteEntry("SimpleService.OnStart", DateTime.Now.ToLongTimeString() +
                    " - Starting the service worker thread.");
                */
                workerThread = new System.Threading.Thread(new System.Threading.ThreadStart(ServiceWorkerMethod));
                workerThread.Start();
            }
            if (workerThread != null)
            {
                /*
                EventLog.WriteEntry("SimpleService.OnStart", DateTime.Now.ToLongTimeString() +
                    " - Worker thread state = " +
                    workerThread.ThreadState.ToString());
                */
            }
            myServiceStatus.currentState = (int)ServiceState.SERVICE_RUNNING;
            SetServiceStatus(handle, myServiceStatus);

        }

        // Stop this service.
        protected override void OnStop()
        {
            // New in .NET Framework version 2.0.
            this.RequestAdditionalTime(4000);
            // Signal the worker thread to exit.
            if ((workerThread != null) && (workerThread.IsAlive))
            {
                /*
                EventLog.WriteEntry("SimpleService.OnStop", DateTime.Now.ToLongTimeString() +
                    " - Stopping the service worker thread.");
                */
                pause.Reset();
                System.Threading.Thread.Sleep(5000);
                workerThread.Abort();

            }
            if (workerThread != null)
            {
                /*
                EventLog.WriteEntry("SimpleService.OnStop", DateTime.Now.ToLongTimeString() +
                    " - OnStop Worker thread state = " +
                    workerThread.ThreadState.ToString());
                */
            }
            // Indicate a successful exit.
            this.ExitCode = 0;
        }

        // Pause the service.
        protected override void OnPause()
        {
            // Pause the worker thread.
            if ((workerThread != null) &&
                (workerThread.IsAlive) &&
                ((workerThread.ThreadState &
                 (System.Threading.ThreadState.Suspended | System.Threading.ThreadState.SuspendRequested)) == 0))
            {
                /*
                EventLog.WriteEntry("SimpleService.OnPause", DateTime.Now.ToLongTimeString() +
                    " - Pausing the service worker thread.");
                */

                pause.Reset();
                System.Threading.Thread.Sleep(5000);
            }

            if (workerThread != null)
            {
                /*
                EventLog.WriteEntry("SimpleService.OnPause", DateTime.Now.ToLongTimeString() +
                    " OnPause - Worker thread state = " +
                    workerThread.ThreadState.ToString());
                */
            }
        }

        // Continue a paused service.
        protected override void OnContinue()
        {

            // Signal the worker thread to continue.
            if ((workerThread != null) && ((workerThread.ThreadState & (System.Threading.ThreadState.Suspended | System.Threading.ThreadState.SuspendRequested)) != 0))
            {
                /*
                EventLog.WriteEntry("SimpleService.OnContinue", DateTime.Now.ToLongTimeString() +
                    " - Resuming the service worker thread.");

                */
                pause.Set();
            }
            if (workerThread != null)
            {
                /*
                EventLog.WriteEntry("SimpleService.OnContinue", DateTime.Now.ToLongTimeString() +
                    " OnContinue - Worker thread state = " +
                    workerThread.ThreadState.ToString());
                */
            }
        }

        // Handle a custom command.
        protected override void OnCustomCommand(int command)
        {
            /*
            EventLog.WriteEntry("SimpleService.OnCustomCommand", DateTime.Now.ToLongTimeString() +
                " - Custom command received: " + command.ToString());
            */

            // If the custom command is recognized,
            // signal the worker thread appropriately.

            switch (command)
            {
                case (int)SimpleServiceCustomCommands.StopWorker:
                    // Signal the worker thread to terminate.
                    // For this custom command, the main service
                    // continues to run without a worker thread.
                    OnStop();
                    break;

                case (int)SimpleServiceCustomCommands.RestartWorker:

                    // Restart the worker thread if necessary.
                    OnStart(null);
                    break;

                case (int)SimpleServiceCustomCommands.CheckWorker:
                    /*
                    // Log the current worker thread state.
                    EventLog.WriteEntry("SimpleService.OnCustomCommand", DateTime.Now.ToLongTimeString() +
                        " OnCustomCommand - Worker thread state = " +
                        workerThread.ThreadState.ToString());
                    */
                    break;

                default:
                    /*
                    EventLog.WriteEntry("SimpleService.OnCustomCommand",
                        DateTime.Now.ToLongTimeString());
                    */
                    break;
            }
        }
        // Handle a session change notice
        protected override void OnSessionChange(SessionChangeDescription changeDescription)
        {
            /*
            EventLog.WriteEntry("SimpleService.OnSessionChange", DateTime.Now.ToLongTimeString() +
                " - Session change notice received: " +
                changeDescription.Reason.ToString() + "  Session ID: " + 
                changeDescription.SessionId.ToString());
            */

            switch (changeDescription.Reason)
            {
                case SessionChangeReason.SessionLogon:
                    userCount += 1;
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() +
                        " SessionLogon, total users: " +
                        userCount.ToString());
                    */
                    break;

                case SessionChangeReason.SessionLogoff:

                    userCount -= 1;
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() +
                        " SessionLogoff, total users: " +
                        userCount.ToString());
                    */
                    break;
                case SessionChangeReason.RemoteConnect:
                    userCount += 1;
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() +
                        " RemoteConnect, total users: " +
                        userCount.ToString());
                    */
                    break;

                case SessionChangeReason.RemoteDisconnect:

                    userCount -= 1;
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() +
                        " RemoteDisconnect, total users: " +
                        userCount.ToString());
                    */
                    break;
                case SessionChangeReason.SessionLock:
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() + 
                        " SessionLock");
                    */
                    break;

                case SessionChangeReason.SessionUnlock:
                    /*
                    EventLog.WriteEntry("SimpleService.OnSessionChange", 
                        DateTime.Now.ToLongTimeString() + 
                        " SessionUnlock");
                    */
                    break;

                default:

                    break;
            }
        }
        // Define a simple method that runs as the worker thread for 
        // the service.  
        public void ServiceWorkerMethod()
        {
            /*
            EventLog.WriteEntry("SimpleService.WorkerThread", DateTime.Now.ToLongTimeString() +
                " - Starting the service worker thread.");
            */
            try
            {
                do
                {
                    // Simulate 4 seconds of work.
                    System.Threading.Thread.Sleep(4000);
                    // Block if the service is paused or is shutting down.
                    pause.WaitOne();
                    /*
                    EventLog.WriteEntry("SimpleService.WorkerThread", DateTime.Now.ToLongTimeString() +
                        " - heartbeat cycle.");
                    */
                }
                while (true);
            }
            catch (System.Threading.ThreadAbortException)
            {
                // Another thread has signalled that this worker
                // thread must terminate.  Typically, this occurs when
                // the main service thread receives a service stop 
                // command.

                // Write a trace line indicating that the worker thread
                // is exiting.  Notice that this simple thread does
                // not have any local objects or data to clean up.
                /*
                EventLog.WriteEntry("SimpleService.WorkerThread", DateTime.Now.ToLongTimeString() +
                    " - Thread abort signaled.");
                */
            }
            /*

            EventLog.WriteEntry("SimpleService.WorkerThread", DateTime.Now.ToLongTimeString() +
                " - Exiting the service worker thread.");
            */

        }
    }
}