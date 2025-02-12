import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { GetSettingResponse } from './interfaces/myth.interface';
import {
    HostAddress, Locale, Setup, Miscellaneous, EITScanner, ShutWake, BackendWake, BackendControl,
    JobQBackend, JobQCommands, JobQGlobal, EpgDownload
}
    from './interfaces/setup.interface';
import { MythService } from './myth.service';
import { NgForm } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class SetupService {

    m_hostName: string = ""; // hostname of the backend server
    m_initialized: boolean = false;
    requesterForm: NgForm | null = null;


    constructor(private mythService: MythService, private translate: TranslateService) {
        this.mythService.GetHostName().subscribe(data => {
            this.m_hostName = data.String;
        });
    }

    Init(): void {
        this.m_initialized = true;
    }

    getHostName(): string {
        return this.m_hostName;
    }

    m_HostAddressData!: HostAddress;

    getHostAddressData(): HostAddress {
        this.m_HostAddressData = {
            successCount: 0,
            errorCount: 0,
            thisHostName: this.m_hostName,
            BackendServerPort: 4543,
            BackendStatusPort: 4544,
            SecurityPin: '0000',
            AllowConnFromAll: false,
            ListenOnAllIps: true,
            BackendServerIP: '127.0.0.1',
            BackendServerIP6: '::1',
            AllowLinkLocal: true,
            BackendServerAddr: '',
            IsMasterBackend: true,
            MasterServerName: this.m_hostName,
        };
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "BackendServerPort" })
            .subscribe({
                next: data => this.m_HostAddressData.BackendServerPort = Number(data.String),
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "BackendStatusPort" })
            .subscribe({
                next: data => this.m_HostAddressData.BackendStatusPort = Number(data.String),
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "SecurityPin" })
            .subscribe({
                next: data => this.m_HostAddressData.SecurityPin = data.String,
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "AllowConnFromAll" })
            .subscribe({
                next: data => this.m_HostAddressData.AllowConnFromAll = (data.String == "1"),
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "ListenOnAllIps" })
            .subscribe({
                next: data => this.m_HostAddressData.ListenOnAllIps = (data.String == "1"),
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "BackendServerIP" })
            .subscribe({
                next: data => this.m_HostAddressData.BackendServerIP = data.String,
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "BackendServerIP6" })
            .subscribe({
                next: data => this.m_HostAddressData.BackendServerIP6 = data.String,
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "UseLinkLocal" })
            .subscribe({
                next: data => this.m_HostAddressData.AllowLinkLocal = (data.String == "1"),
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "BackendServerAddr" })
            .subscribe({
                next: data => this.m_HostAddressData.BackendServerAddr = data.String,
                error: () => this.m_HostAddressData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "MasterServerName" })
            .subscribe({
                next: data => {
                    this.m_HostAddressData.MasterServerName = data.String;
                    this.m_HostAddressData.IsMasterBackend = (this.m_HostAddressData.MasterServerName == this.m_hostName);
                },
                error: () => this.m_HostAddressData.errorCount++
            });

        return this.m_HostAddressData;
    }

    HostAddressObs = {
        next: (x: any) => {
            if (x.bool)
                this.m_HostAddressData.successCount++;
            else {
                this.m_HostAddressData.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_HostAddressData.errorCount++
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        }
    };

    saveHostAddressData(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_HostAddressData.successCount = 0;
        this.m_HostAddressData.errorCount = 0;
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "BackendServerPort",
            Value: String(this.m_HostAddressData.BackendServerPort)
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "BackendStatusPort",
            Value: String(this.m_HostAddressData.BackendStatusPort)
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "SecurityPin",
            Value: this.m_HostAddressData.SecurityPin
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "AllowConnFromAll",
            Value: this.m_HostAddressData.AllowConnFromAll ? "1" : "0"
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "ListenOnAllIps",
            Value: this.m_HostAddressData.ListenOnAllIps ? "1" : "0"
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "BackendServerIP",
            Value: this.m_HostAddressData.BackendServerIP
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "BackendServerIP6",
            Value: this.m_HostAddressData.BackendServerIP6
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "AllowLinkLocal",
            Value: this.m_HostAddressData.AllowLinkLocal ? "1" : "0"
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "BackendServerAddr",
            Value: this.m_HostAddressData.BackendServerAddr
        }).subscribe(this.HostAddressObs);
        this.mythService.PutSetting({
            HostName: "_GLOBAL_", Key: "MasterServerName",
            Value: this.m_HostAddressData.MasterServerName
        }).subscribe(this.HostAddressObs);

    }

    m_LocaleData!: Locale;

    getLocaleData(): Locale {
        this.m_LocaleData = {
            successCount: 0,
            errorCount: 0,
            TVFormat: 'PAL',
            VbiFormat: 'None',
            FreqTable: 'us-bcast'
        }
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "TVFormat" })
            .subscribe({
                next: data => this.m_LocaleData.TVFormat = data.String,
                error: () => this.m_LocaleData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "VbiFormat" })
            .subscribe({
                next: data => this.m_LocaleData.VbiFormat = data.String,
                error: () => this.m_LocaleData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "FreqTable" })
            .subscribe({
                next: data => this.m_LocaleData.FreqTable = data.String,
                error: () => this.m_LocaleData.errorCount++
            });
        return this.m_LocaleData;
    }

    LocaleObs = {
        next: (x: any) => {
            if (x.bool)
                this.m_LocaleData.successCount++;
            else {
                this.m_LocaleData.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_LocaleData.errorCount++
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        }
    };


    saveLocaleData(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_LocaleData.successCount = 0;
        this.m_LocaleData.errorCount = 0;

        this.mythService.PutSetting({
            HostName: "_GLOBAL_", Key: "TVFormat",
            Value: this.m_LocaleData.TVFormat
        }).subscribe(this.LocaleObs);
        this.mythService.PutSetting({
            HostName: "_GLOBAL_", Key: "VbiFormat",
            Value: this.m_LocaleData.VbiFormat
        }).subscribe(this.LocaleObs);
        this.mythService.PutSetting({
            HostName: "_GLOBAL_", Key: "FreqTable",
            Value: this.m_LocaleData.FreqTable
        }).subscribe(this.LocaleObs);
    }


    // Setup combines the first two sets, HostAddress and Locale

    m_setupData!: Setup;

    getSetupData(): Setup {
        this.getHostAddressData();
        this.getLocaleData();
        this.m_setupData = {
            General: {
                HostAddress: this.m_HostAddressData,
                Locale: this.m_LocaleData
            }
        }
        return this.m_setupData;
    }

    m_miscellaneousData!: Miscellaneous;

    getMiscellaneousData(): Miscellaneous {
        this.m_miscellaneousData = {
            successCount: 0,
            errorCount: 0,
            MasterBackendOverride: false,
            DeletesFollowLinks: false,
            TruncateDeletesSlowly: false,
            HDRingbufferSize: 9400,
            StorageScheduler: "BalancedFreeSpace",
            UPNPWmpSource: "0",
            MiscStatusScript: "",
            DisableAutomaticBackup: false,
            DisableFirewireReset: false,
        };

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "MasterBackendOverride", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.MasterBackendOverride = (data.String == "1"),
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "DeletesFollowLinks", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.DeletesFollowLinks = (data.String == "1"),
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "TruncateDeletesSlowly", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.TruncateDeletesSlowly = (data.String == "1"),
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "HDRingbufferSize", Default: "9400" })
            .subscribe({
                next: data => this.m_miscellaneousData.HDRingbufferSize = Number(data.String),
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "StorageScheduler", Default: "BalancedFreeSpace" })
            .subscribe({
                next: data => this.m_miscellaneousData.StorageScheduler = data.String,
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "UPNPWmpSource", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.UPNPWmpSource = data.String,
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "MiscStatusScript", Default: "" })
            .subscribe({
                next: data => this.m_miscellaneousData.MiscStatusScript = data.String,
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "DisableAutomaticBackup", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.DisableAutomaticBackup = (data.String == "1"),
                error: () => this.m_miscellaneousData.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "DisableFirewireReset", Default: "0" })
            .subscribe({
                next: data => this.m_miscellaneousData.DisableFirewireReset = (data.String == "1"),
                error: () => this.m_miscellaneousData.errorCount++
            });

        return this.m_miscellaneousData;
    }

    miscObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_miscellaneousData.successCount++;
            else {
                this.m_miscellaneousData.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_miscellaneousData.errorCount++
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        }
    };

    saveMiscellaneousSettings(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_miscellaneousData.successCount = 0;
        this.m_miscellaneousData.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "MasterBackendOverride",
            Value: this.m_miscellaneousData.MasterBackendOverride ? "1" : "0"
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "DeletesFollowLinks",
            Value: this.m_miscellaneousData.DeletesFollowLinks ? "1" : "0"
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "TruncateDeletesSlowly",
            Value: this.m_miscellaneousData.TruncateDeletesSlowly ? "1" : "0"
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "HDRingbufferSize",
            Value: String(this.m_miscellaneousData.HDRingbufferSize)
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "StorageScheduler",
            Value: this.m_miscellaneousData.StorageScheduler
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "UPNPWmpSource",
            Value: this.m_miscellaneousData.UPNPWmpSource
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "MiscStatusScript",
            Value: this.m_miscellaneousData.MiscStatusScript
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "DisableAutomaticBackup",
            Value: this.m_miscellaneousData.DisableAutomaticBackup ? "1" : "0"
        })
            .subscribe(this.miscObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "DisableFirewireReset",
            Value: this.m_miscellaneousData.DisableFirewireReset ? "1" : "0"
        })
            .subscribe(this.miscObserver);
    }

    m_EITScanner!: EITScanner;

    getEITScanner(): EITScanner {
        this.m_EITScanner = {
            successCount: 0,
            errorCount: 0,
            EITTransportTimeout: 5,
            EITCrawIdleStart: 60
        }

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "EITTransportTimeout", Default: "5" })
            .subscribe({
                next: data => this.m_EITScanner.EITTransportTimeout = Number(data.String),
                error: () => this.m_EITScanner.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "EITCrawIdleStart", Default: "60" })
            .subscribe({
                next: data => this.m_EITScanner.EITCrawIdleStart = Number(data.String),
                error: () => this.m_EITScanner.errorCount++
            });

        return this.m_EITScanner;
    }

    eitObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_EITScanner.successCount++;
            else {
                this.m_EITScanner.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_EITScanner.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveEITScanner(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_EITScanner.successCount = 0;
        this.m_EITScanner.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "EITTransportTimeout",
            Value: String(this.m_EITScanner.EITTransportTimeout)
        }).subscribe(this.eitObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "EITCrawIdleStart",
            Value: String(this.m_EITScanner.EITCrawIdleStart)
        }).subscribe(this.eitObserver);
    }

    m_ShutWake!: ShutWake;

    getShutWake(): ShutWake {
        this.m_ShutWake = {
            successCount: 0,
            errorCount: 0,
            startupCommand: "",
            blockSDWUwithoutClient: true,
            idleTimeoutSecs: 0,
            idleWaitForRecordingTime: 15,
            StartupSecsBeforeRecording: 120,
            WakeupTimeFormat: "hh:mm yyyy-MM-dd",
            SetWakeuptimeCommand: "",
            ServerHaltCommand: "sudo /sbin/halt -p",
            preSDWUCheckCommand: ""
        }

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "startupCommand", Default: "" })
            .subscribe({
                next: data => this.m_ShutWake.startupCommand = data.String,
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "blockSDWUwithoutClient", Default: "1" })
            .subscribe({
                next: data => this.m_ShutWake.blockSDWUwithoutClient = (data.String == '1'),
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "idleTimeoutSecs", Default: "0" })
            .subscribe({
                next: data => this.m_ShutWake.idleTimeoutSecs = Number(data.String),
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "idleWaitForRecordingTime", Default: "" })
            .subscribe({
                next: data => this.m_ShutWake.idleWaitForRecordingTime = Number(data.String),
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "StartupSecsBeforeRecording", Default: "120" })
            .subscribe({
                next: data => this.m_ShutWake.StartupSecsBeforeRecording = Number(data.String),
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "WakeupTimeFormat", Default: "hh:mm yyyy-MM-dd" })
            .subscribe({
                next: data => this.m_ShutWake.WakeupTimeFormat = data.String,
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "SetWakeuptimeCommand", Default: "" })
            .subscribe({
                next: data => this.m_ShutWake.SetWakeuptimeCommand = data.String,
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "ServerHaltCommand", Default: "sudo /sbin/halt -p" })
            .subscribe({
                next: data => this.m_ShutWake.ServerHaltCommand = data.String,
                error: () => this.m_ShutWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "preSDWUCheckCommand", Default: "" })
            .subscribe({
                next: data => this.m_ShutWake.preSDWUCheckCommand = data.String,
                error: () => this.m_ShutWake.errorCount++
            });

        return this.m_ShutWake;
    }

    swObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_ShutWake.successCount++;
            else {
                this.m_ShutWake.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_ShutWake.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveShutWake(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_ShutWake.successCount = 0;
        this.m_ShutWake.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "startupCommand",
            Value: this.m_ShutWake.startupCommand
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "blockSDWUwithoutClient",
            Value: this.m_ShutWake.blockSDWUwithoutClient ? "1" : "0"
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "idleTimeoutSecs",
            Value: String(this.m_ShutWake.idleTimeoutSecs)
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "idleWaitForRecordingTime",
            Value: String(this.m_ShutWake.idleWaitForRecordingTime)
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "StartupSecsBeforeRecording",
            Value: String(this.m_ShutWake.StartupSecsBeforeRecording)
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "WakeupTimeFormat",
            Value: this.m_ShutWake.WakeupTimeFormat
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "SetWakeuptimeCommand",
            Value: this.m_ShutWake.SetWakeuptimeCommand
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "ServerHaltCommand",
            Value: this.m_ShutWake.ServerHaltCommand
        }).subscribe(this.swObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "preSDWUCheckCommand",
            Value: this.m_ShutWake.preSDWUCheckCommand
        }).subscribe(this.swObserver);
    }

    m_BackendWake!: BackendWake;

    getBackendWake(): BackendWake {
        this.m_BackendWake = {
            successCount: 0,
            errorCount: 0,
            WOLbackendReconnectWaitTime: 0,
            WOLbackendConnectRetry: 5,
            WOLbackendCommand: "",
            SleepCommand: "",
            WakeUpCommand: ""
        }

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "WOLbackendReconnectWaitTime", Default: "0" })
            .subscribe({
                next: data => this.m_BackendWake.WOLbackendReconnectWaitTime = Number(data.String),
                error: () => this.m_BackendWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "WOLbackendConnectRetry", Default: "5" })
            .subscribe({
                next: data => this.m_BackendWake.WOLbackendConnectRetry = Number(data.String),
                error: () => this.m_BackendWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "WOLbackendCommand", Default: "" })
            .subscribe({
                next: data => this.m_BackendWake.WOLbackendCommand = data.String,
                error: () => this.m_BackendWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "SleepCommand", Default: "" })
            .subscribe({
                next: data => this.m_BackendWake.SleepCommand = data.String,
                error: () => this.m_BackendWake.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "WakeUpCommand", Default: "" })
            .subscribe({
                next: data => this.m_BackendWake.WakeUpCommand = data.String,
                error: () => this.m_BackendWake.errorCount++
            });

        return this.m_BackendWake;
    }

    bewObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_BackendWake.successCount++;
            else {
                this.m_BackendWake.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_BackendWake.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveBackendWake(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_BackendWake.successCount = 0;
        this.m_BackendWake.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "WOLbackendReconnectWaitTime",
            Value: String(this.m_BackendWake.WOLbackendReconnectWaitTime)
        }).subscribe(this.bewObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "WOLbackendConnectRetry",
            Value: String(this.m_BackendWake.WOLbackendConnectRetry)
        }).subscribe(this.bewObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "WOLbackendCommand",
            Value: this.m_BackendWake.WOLbackendCommand
        }).subscribe(this.bewObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "SleepCommand",
            Value: this.m_BackendWake.SleepCommand
        }).subscribe(this.bewObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "WakeUpCommand",
            Value: this.m_BackendWake.WakeUpCommand
        }).subscribe(this.bewObserver);
    }

    m_BackendControl!: BackendControl;

    getBackendControl(): BackendControl {
        this.m_BackendControl = {
            successCount: 0,
            errorCount: 0,
            BackendStopCommand: "killall mythbackend",
            BackendStartCommand: "mythbackend"
        }

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "BackendStopCommand", Default: "killall mythbackend" })
            .subscribe({
                next: data => this.m_BackendControl.BackendStopCommand = data.String,
                error: () => this.m_BackendControl.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "BackendStartCommand", Default: "mythbackend" })
            .subscribe({
                next: data => this.m_BackendControl.BackendStartCommand = data.String,
                error: () => this.m_BackendControl.errorCount++
            });

        return this.m_BackendControl;
    }

    becObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_BackendControl.successCount++;
            else {
                this.m_BackendControl.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_BackendControl.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveBackendControl(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_BackendControl.successCount = 0;
        this.m_BackendControl.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "BackendStopCommand",
            Value: this.m_BackendControl.BackendStopCommand
        }).subscribe(this.becObserver);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "BackendStartCommand",
            Value: this.m_BackendControl.BackendStartCommand
        }).subscribe(this.becObserver);
    }

    m_JobQBackend!: JobQBackend;

    parseTime(date: Date, string: String) {
        let parts = string.split(':');
        date.setHours(Number(parts[0]));
        date.setMinutes(Number(parts[1]));
    }

    formatTime(date: Date): string {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let string = "";
        if (hours < 10) {
            string += "0"
        }
        string += String(hours);
        string += ":";
        if (minutes < 10) {
            string += "0"
        }
        string += String(minutes);
        return string;
    }

    getJobQBackend(): JobQBackend {
        this.m_JobQBackend = {
            successCount: 0,
            errorCount: 0,
            JobQueueMaxSimultaneousJobs: 1,
            JobQueueCheckFrequency: 60,
            JobQueueWindowStart: new Date(0),
            JobQueueWindowStart$: new Observable<GetSettingResponse>(),
            JobQueueWindowEnd: new Date(0),
            JobQueueWindowEnd$: new Observable<GetSettingResponse>(),
            JobQueueCPU: "0",
            JobAllowMetadata: true,
            JobAllowCommFlag: true,
            JobAllowTranscode: true,
            JobAllowPreview: true,
            JobAllowUserJob1: false,
            JobAllowUserJob2: false,
            JobAllowUserJob3: false,
            JobAllowUserJob4: false,
        }
        this.parseTime(this.m_JobQBackend.JobQueueWindowStart, "00:00");
        this.parseTime(this.m_JobQBackend.JobQueueWindowEnd, "23:59");

        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobQueueMaxSimultaneousJobs", Default: "1" })
            .subscribe({
                next: data => this.m_JobQBackend.JobQueueMaxSimultaneousJobs = Number(data.String),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobQueueCheckFrequency", Default: "60" })
            .subscribe({
                next: data => this.m_JobQBackend.JobQueueCheckFrequency = Number(data.String),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.m_JobQBackend.JobQueueWindowStart$ = this.mythService.GetSetting({
            HostName: this.m_hostName, Key: "JobQueueWindowStart", Default: "00:00"
        });
        this.m_JobQBackend.JobQueueWindowStart$
            .subscribe({
                next: data => this.parseTime(this.m_JobQBackend.JobQueueWindowStart, data.String),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.m_JobQBackend.JobQueueWindowEnd$ = this.mythService.GetSetting({
            HostName: this.m_hostName, Key: "JobQueueWindowEnd", Default: "23:59"
        });
        this.m_JobQBackend.JobQueueWindowEnd$
            .subscribe({
                next: data => this.parseTime(this.m_JobQBackend.JobQueueWindowEnd, data.String),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobQueueCPU", Default: "0" })
            .subscribe({
                next: data => this.m_JobQBackend.JobQueueCPU = data.String,
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowMetadata", Default: "1" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowMetadata = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowCommFlag", Default: "1" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowCommFlag = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowTranscode", Default: "1" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowTranscode = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowPreview", Default: "1" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowPreview = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowUserJob1", Default: "0" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowUserJob1 = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowUserJob2", Default: "0" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowUserJob2 = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowUserJob3", Default: "0" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowUserJob3 = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        this.mythService.GetSetting({ HostName: this.m_hostName, Key: "JobAllowUserJob4", Default: "0" })
            .subscribe({
                next: data => this.m_JobQBackend.JobAllowUserJob4 = (data.String == '1'),
                error: () => this.m_JobQBackend.errorCount++
            });
        return this.m_JobQBackend;
    }

    jqbObserver = {
        next: (x: any) => {
            if (x.bool)
                this.m_JobQBackend.successCount++;
            else {
                this.m_JobQBackend.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_JobQBackend.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveJobQBackend(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_JobQBackend.successCount = 0;
        this.m_JobQBackend.errorCount = 0;
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobQueueMaxSimultaneousJobs",
            Value: String(this.m_JobQBackend.JobQueueMaxSimultaneousJobs)
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobQueueCheckFrequency",
            Value: String(this.m_JobQBackend.JobQueueCheckFrequency)
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobQueueWindowStart",
            Value: this.formatTime(this.m_JobQBackend.JobQueueWindowStart)
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobQueueWindowEnd",
            Value: this.formatTime(this.m_JobQBackend.JobQueueWindowEnd)
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobQueueCPU",
            Value: this.m_JobQBackend.JobQueueCPU
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowMetadata",
            Value: this.m_JobQBackend.JobAllowMetadata ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowCommFlag",
            Value: this.m_JobQBackend.JobAllowCommFlag ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowTranscode",
            Value: this.m_JobQBackend.JobAllowTranscode ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowPreview",
            Value: this.m_JobQBackend.JobAllowPreview ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowUserJob1",
            Value: this.m_JobQBackend.JobAllowUserJob1 ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowUserJob2",
            Value: this.m_JobQBackend.JobAllowUserJob2 ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowUserJob3",
            Value: this.m_JobQBackend.JobAllowUserJob3 ? "1" : "0"
        }).subscribe(this.jqbObserver);
        this.mythService.PutSetting({
            HostName: this.m_hostName, Key: "JobAllowUserJob4",
            Value: this.m_JobQBackend.JobAllowUserJob4 ? "1" : "0"
        }).subscribe(this.jqbObserver);

    }

    m_JobQCommands!: JobQCommands;

    getJobQCommands(): JobQCommands {
        // if already loaded, simply retrun the existing object.
        // This is different from others since it is used by more than one tab
        // and must not be reloaded for the other tab, as that may overwrite
        // unsaved changes.
        if (typeof this.m_JobQCommands == 'object')
            return this.m_JobQCommands;

        this.m_JobQCommands = {
            successCount: 0,
            errorCount: 0,
            UserJobDesc: [],
            UserJob: []
        }
        for (let ix = 0; ix < 4; ix++) {
            let num = ix + 1;
            let defaultName;
            this.translate.get('settings.services.job_default', { num: num })
                .subscribe(data => this.m_JobQCommands.UserJobDesc[ix] = data);
            this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "UserJobDesc" + num, Default: defaultName })
                .subscribe({
                    next: data => this.m_JobQCommands.UserJobDesc[ix] = data.String,
                    error: () => this.m_JobQBackend.errorCount++
                });
            this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "UserJob" + num, Default: "" })
                .subscribe({
                    next: data => this.m_JobQCommands.UserJob[ix] = data.String,
                    error: () => this.m_JobQBackend.errorCount++
                });
        }
        return this.m_JobQCommands;
    }

    JobQCommandsObs = {
        next: (x: any) => {
            if (x.bool)
                this.m_JobQCommands.successCount++;
            else {
                this.m_JobQCommands.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_JobQCommands.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveJobQCommands(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_JobQCommands.successCount = 0;
        this.m_JobQCommands.errorCount = 0;
        for (let ix = 0; ix < 4; ix++) {
            let num = ix + 1;
            this.mythService.PutSetting({
                HostName: '_GLOBAL_', Key: "UserJobDesc" + num,
                Value: this.m_JobQCommands.UserJobDesc[ix]
            }).subscribe(this.JobQCommandsObs);
            this.mythService.PutSetting({
                HostName: '_GLOBAL_', Key: "UserJob" + num,
                Value: this.m_JobQCommands.UserJob[ix]
            }).subscribe(this.JobQCommandsObs);
        }
    }

    m_JobQGlobal!: JobQGlobal;

    getJobQGlobal(): JobQGlobal {
        this.m_JobQGlobal = {
            successCount: 0,
            errorCount: 0,
            JobsRunOnRecordHost: false,
            AutoCommflagWhileRecording: false,
            JobQueueCommFlagCommand: "mythcommflag",
            JobQueueTranscodeCommand: "mythtranscode",
            AutoTranscodeBeforeAutoCommflag: false,
            SaveTranscoding: false,
        }

        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "JobsRunOnRecordHost", Default: "0" })
            .subscribe({
                next: data => this.m_JobQGlobal.JobsRunOnRecordHost = (data.String == '1'),
                error: () => this.m_JobQGlobal.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "AutoCommflagWhileRecording", Default: "0" })
            .subscribe({
                next: data => this.m_JobQGlobal.AutoCommflagWhileRecording = (data.String == '1'),
                error: () => this.m_JobQGlobal.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "JobQueueCommFlagCommand", Default: "mythcommflag" })
            .subscribe({
                next: data => this.m_JobQGlobal.JobQueueCommFlagCommand = data.String,
                error: () => this.m_JobQGlobal.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "JobQueueTranscodeCommand", Default: "mythtranscode" })
            .subscribe({
                next: data => this.m_JobQGlobal.JobQueueTranscodeCommand = data.String,
                error: () => this.m_JobQGlobal.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "AutoTranscodeBeforeAutoCommflag", Default: "0" })
            .subscribe({
                next: data => this.m_JobQGlobal.AutoTranscodeBeforeAutoCommflag = (data.String == '1'),
                error: () => this.m_JobQGlobal.errorCount++
            });
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "SaveTranscoding", Default: "0" })
            .subscribe({
                next: data => this.m_JobQGlobal.SaveTranscoding = (data.String == '1'),
                error: () => this.m_JobQGlobal.errorCount++
            });
        return this.m_JobQGlobal;
    }


    JobQGlobalObs = {
        next: (x: any) => {
            if (x.bool)
                this.m_JobQGlobal.successCount++;
            else {
                this.m_JobQGlobal.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_JobQGlobal.errorCount++;
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveJobQGlobal(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_JobQGlobal.successCount = 0;
        this.m_JobQGlobal.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "JobsRunOnRecordHost",
            Value: this.m_JobQGlobal.JobsRunOnRecordHost ? "1" : "0"
        }).subscribe(this.JobQGlobalObs);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "AutoCommflagWhileRecording",
            Value: this.m_JobQGlobal.AutoCommflagWhileRecording ? "1" : "0"
        }).subscribe(this.JobQGlobalObs);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "JobQueueCommFlagCommand",
            Value: this.m_JobQGlobal.JobQueueCommFlagCommand
        }).subscribe(this.JobQGlobalObs);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "JobQueueTranscodeCommand",
            Value: this.m_JobQGlobal.JobQueueTranscodeCommand
        }).subscribe(this.JobQGlobalObs);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "AutoTranscodeBeforeAutoCommflag",
            Value: this.m_JobQGlobal.AutoTranscodeBeforeAutoCommflag ? "1" : "0"
        }).subscribe(this.JobQGlobalObs);
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "SaveTranscoding",
            Value: this.m_JobQGlobal.SaveTranscoding ? "1" : "0"
        }).subscribe(this.JobQGlobalObs);
    }

    m_EpgDownload!: EpgDownload;

    getEpgDownload(): EpgDownload {
        this.m_EpgDownload = {
            successCount: 0,
            errorCount: 0,
            MythFillEnabled: true
        }
        this.mythService.GetSetting({ HostName: '_GLOBAL_', Key: "MythFillEnabled", Default: "1" })
            .subscribe({
                next: data => this.m_EpgDownload.MythFillEnabled = (data.String == '1'),
                error: () => this.m_EpgDownload.errorCount++
            });
        return this.m_EpgDownload;
    }

    EpgDownloadObs = {
        next: (x: any) => {
            if (x.bool)
                this.m_EpgDownload.successCount++;
            else {
                this.m_EpgDownload.errorCount++;
                if (this.requesterForm)
                    this.requesterForm.form.markAsDirty();
            }
        },
        error: (err: any) => {
            console.error(err);
            this.m_EpgDownload.errorCount++
            if (this.requesterForm)
                this.requesterForm.form.markAsDirty();
        },
    };

    saveEpgDownload(requesterForm: NgForm | null) {
        this.requesterForm = requesterForm;
        this.m_EpgDownload.successCount = 0;
        this.m_EpgDownload.errorCount = 0;
        this.mythService.PutSetting({
            HostName: '_GLOBAL_', Key: "MythFillEnabled",
            Value: this.m_EpgDownload.MythFillEnabled ? "1" : "0"
        }).subscribe(this.EpgDownloadObs);
    }

    currentForm: NgForm | null = null;

    getCurrentForm(): NgForm | null {
        return this.currentForm;
    }

    setCurrentForm(form: NgForm | null) {
        this.currentForm = form;

    }

}
