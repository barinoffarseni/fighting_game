function GetAttackBoxDirection(x1, x2) {
    if (x1 >= x2) {
        return -1
    } else {
        return 1
    }
}

function checkAttackIsSuccess(attacker, victim) {
    setAttackBoxMinMaxPosition(attacker)
    // if (attacker.atackBox.widthDirection > 0) {
    //     attacker.attackBoxXMin = attacker.getAttackBoxPosition().x
    //     attacker.attackBoxXMax = attacker.getAttackBoxPosition().x + attacker.atackBox.width * attacker.atackBox.widthDirection
    // } else {
    //     attacker.attackBoxXMin = attacker.getAttackBoxPosition().x + attacker.atackBox.width * attacker.atackBox.widthDirection
    //     attacker.attackBoxXMax = attacker.getAttackBoxPosition().x
    // }

    xMin = victim.position.x
    xMax = victim.position.x + victim.width

    if (attacker.getAttackBoxPosition().y + attacker.atackBox.height >= victim.position.y) {
        if (xMin < attacker.attackBoxXMin && xMax > attacker.attackBoxXMin) {
            return true
        }

        if (xMin > attacker.attackBoxXMin && xMax < attacker.attackBoxXMax) {
            return true
        }

        if (xMin < attacker.attackBoxXMax && xMax > attacker.attackBoxXMax) {
            return true
        }
    }
}

function setAttackBoxMinMaxPosition(attacker) {
    if (attacker.atackBox.widthDirection > 0) {
        attacker.attackBoxXMin = attacker.getAttackBoxPosition().x
        attacker.attackBoxXMax = attacker.getAttackBoxPosition().x + attacker.atackBox.width * attacker.atackBox.widthDirection
    } else {
        attacker.attackBoxXMin = attacker.getAttackBoxPosition().x + attacker.atackBox.width * attacker.atackBox.widthDirection
        attacker.attackBoxXMax = attacker.getAttackBoxPosition().x
    }
}