
local successCb
local resultReceived = false

RegisterNUICallback('CujionNumberUpResults', function(data, cb)
    SetNuiFocus(false, false)
    resultReceived = true
    successCb(data.success)
    cb('ok')
end)

RegisterCommand('NumberUp', function(source, args)
    exports["Cujion-NumberUp"]:cujionnumberup(
    function(success)
        if success then
            print("success")
        else
            print('failed')
        end
    end, 5, 5, 30, 5, 3) --numRows(1-11), numCols(1-11), gameDuration(secs), shuffleInterval(secs), maxWrong
end)

exports('cujionnumberup', function(success, numRows, numCols, gameDuration, shuffleInterval, maxWrong)
    -- numRows = Number of grid rows (min-1/max-11)
    -- numCols = Number of grid cols (min-1/max-11)
    -- gameDuration = Length in secs you have to finish minigame
    -- shuffleInterval = Length in seconds you have before grid shuffle
    -- maxWrong = Maximum number of wrong inputs
    resultReceived = false
    successCb = success
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "Start",
        rows = numRows,
        cols = numCols,
        duration = gameDuration,
        shuffle = shuffleInterval,
        wrong = maxWrong,
    })
end)
