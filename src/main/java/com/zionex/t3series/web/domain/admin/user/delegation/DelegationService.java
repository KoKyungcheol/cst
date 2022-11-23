package com.zionex.t3series.web.domain.admin.user.delegation;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DelegationService {

    private final DelegationRepository delegationRepository;
    private final DelegationQueryRepository delegationQueryRepository;

    public List<Delegation> getDelegations(String username, String delegationUsername) {
        List<Delegation> delegations = delegationQueryRepository.getDelegations(username, delegationUsername);

        List<Delegation> inValidDelegations = new ArrayList<>();
        delegations = delegations
                .stream()
                .filter(d -> {
                    if (d.getUserId() == null || d.getDelegationUserId() == null) {
                        inValidDelegations.add(d);
                        return false;
                    } else {
                        return true;
                    }
                })
                .collect(Collectors.toList());

        delegationRepository.deleteAll(inValidDelegations);
        return delegations;
    }

    public List<String> getDelegatedUserIds(String delegationUserId) {
        List<Delegation> delegations = delegationRepository.findByDelegationUserId(delegationUserId);

        final LocalDateTime now = LocalDateTime.now();
        return delegations
                .stream()
                .filter(d -> d.checkValidation(now))
                .map(d -> d.getUserId())
                .collect(Collectors.toList());
    }

    public void saveDelegations(List<Delegation> delegations) {
        delegations = delegations.stream().peek(delegation -> {
            String userId = delegation.getUserId();
            String delegationUserId = delegation.getDelegationUserId();

            if (delegationRepository.existsByUserIdAndDelegationUserId(userId, delegationUserId)) {
                Delegation existsDelegation = delegationRepository.findByUserIdAndDelegationUserId(userId, delegationUserId);
                delegation.setId(existsDelegation.getId());
            }
        }).collect(Collectors.toList());

        delegationRepository.saveAll(delegations);
    }

    public void deleteDelegations(List<Delegation> delegations) {
        delegations.forEach(d -> delegationRepository.deleteByUserIdAndDelegationUserId(d.getUserId(), d.getDelegationUserId()));
    }

    public void deleteDelegationsByUserId(List<String> userIds) {
        userIds.forEach(userId -> delegationRepository.deleteByUserIdOrDelegationUserId(userId, userId));
    }

}
